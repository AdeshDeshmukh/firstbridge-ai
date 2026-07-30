import logger from '../utils/logger'
import { backboardConfig, getAgentId, AgentName } from '../lib/backboard'


export class BackboardTimeoutError extends Error {
  constructor(public readonly agent: AgentName) {
    super(`Backboard request to "${agent}" timed out after ${backboardConfig.timeoutMs}ms`)
    this.name = 'BackboardTimeoutError'
  }
}

export class BackboardRateLimitError extends Error {
  constructor(public readonly agent: AgentName) {
    super(`Backboard rate limit hit for "${agent}"`)
    this.name = 'BackboardRateLimitError'
  }
}

export class BackboardError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'BackboardError'
  }
}

// Thrown immediately, without attempting a network call, when the circuit
// for an agent is OPEN. This is the whole point of a circuit breaker: fail
// fast and cheap instead of piling up slow, doomed requests against an
// agent that's already known to be down.
export class BackboardCircuitOpenError extends Error {
  constructor(public readonly agent: AgentName, public readonly retryAt: Date) {
    super(`Circuit open for "${agent}" — service assumed unavailable until ${retryAt.toISOString()}`)
    this.name = 'BackboardCircuitOpenError'
  }
}

export interface SendMessageParams {
  agent: AgentName
  userId: string
  message: string

  context: Record<string, unknown>
}

export interface BackboardReply {
  reply: string

  raw: unknown
}

interface BackboardRequestBody {
  userId: string
  message: string
  context: Record<string, unknown>
}


// CIRCUIT BREAKER
// One breaker per agent (Vera / Grant / Atlas) rather than one global
// breaker — if Atlas's upstream agent is misbehaving, Vera and Grant should
// still be usable. Classic 3-state machine:


enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeoutMs: number
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private consecutiveFailures = 0
  private openedAt: number | null = null
  private halfOpenInFlight = false

  constructor(private readonly agent: AgentName, private readonly options: CircuitBreakerOptions) {}

  // Called before every attempt. Throws if the circuit won't allow a call.
  assertCanRequest(): void {
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - (this.openedAt ?? 0)
      if (elapsed < this.options.resetTimeoutMs) {
        const retryAt = new Date((this.openedAt ?? 0) + this.options.resetTimeoutMs)
        throw new BackboardCircuitOpenError(this.agent, retryAt)
      }
      // Reset window has elapsed — allow exactly one trial request through.
      this.state = CircuitState.HALF_OPEN
      this.halfOpenInFlight = false
      logger.info('Backboard circuit half-open, allowing trial request', { agent: this.agent })
    }

    if (this.state === CircuitState.HALF_OPEN && this.halfOpenInFlight) {
      const retryAt = new Date((this.openedAt ?? 0) + this.options.resetTimeoutMs)
      throw new BackboardCircuitOpenError(this.agent, retryAt)
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenInFlight = true
    }
  }

  onSuccess(): void {
    if (this.state !== CircuitState.CLOSED) {
      logger.info('Backboard circuit closed after successful trial', { agent: this.agent })
    }
    this.state = CircuitState.CLOSED
    this.consecutiveFailures = 0
    this.openedAt = null
    this.halfOpenInFlight = false
  }

  onFailure(): void {
    this.halfOpenInFlight = false

    if (this.state === CircuitState.HALF_OPEN) {
      // Trial request failed — straight back to OPEN, restart the timer.
      this.trip()
      return
    }

    this.consecutiveFailures += 1
    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.trip()
    }
  }

  private trip(): void {
    this.state = CircuitState.OPEN
    this.openedAt = Date.now()
    logger.error('Backboard circuit opened', {
      agent: this.agent,
      consecutiveFailures: this.consecutiveFailures,
      resetTimeoutMs: this.options.resetTimeoutMs,
    })
  }

  getState(): CircuitState {
    return this.state
  }
}

const CIRCUIT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
}

const breakers = new Map<AgentName, CircuitBreaker>()

function getBreaker(agent: AgentName): CircuitBreaker {
  let breaker = breakers.get(agent)
  if (!breaker) {
    breaker = new CircuitBreaker(agent, CIRCUIT_OPTIONS)
    breakers.set(agent, breaker)
  }
  return breaker
}

const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 300
const RETRY_MAX_DELAY_MS = 4_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number): number {
  const exponential = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS)
  const jitterFactor = 0.5 + Math.random() // range: 0.5x – 1.5x
  return Math.round(exponential * jitterFactor)
}

function isRetryableStatus(status: number | undefined): boolean {
  if (status === undefined) return true // network error / no response at all
  return status === 429 || status >= 500
}


// CORE REQUEST (timeout + single attempt; retry loop wraps this)


async function attemptRequest(
  agent: AgentName,
  body: BackboardRequestBody
): Promise<BackboardReply> {
  const agentId = getAgentId(agent)
  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), backboardConfig.timeoutMs)

  try {
    const response = await fetch(`${backboardConfig.baseUrl}/agents/${agentId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${backboardConfig.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {

      logger.warn('Backboard non-OK response', { agent, status: response.status })

      if (response.status === 429) {
        throw new BackboardRateLimitError(agent)
      }
      throw new BackboardError(`Backboard returned ${response.status}`, response.status)
    }

    const data = await response.json()
    return { reply: data.reply, raw: data }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new BackboardTimeoutError(agent)
    }

    if (
      err instanceof BackboardError ||
      err instanceof BackboardRateLimitError ||
      err instanceof BackboardTimeoutError
    ) {
      throw err
    }
    throw new BackboardError((err as Error).message)
  } finally {
    clearTimeout(timeoutHandle)
  }
}


async function requestWithRetry(
  agent: AgentName,
  body: BackboardRequestBody
): Promise<BackboardReply> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptRequest(agent, body)
    } catch (err) {
      lastError = err as Error
      const status = err instanceof BackboardError ? err.status : undefined
      const retryable =
        err instanceof BackboardTimeoutError ||
        err instanceof BackboardRateLimitError ||
        (err instanceof BackboardError && isRetryableStatus(status))

      if (!retryable || attempt === MAX_RETRIES) {
        throw err
      }

      const delay = backoffDelay(attempt)
      logger.warn('Backboard request failed, retrying', {
        agent,
        attempt: attempt + 1,
        maxRetries: MAX_RETRIES,
        delayMs: delay,
        errorType: (err as Error).name,
      })
      await sleep(delay)
    }
  }


  throw lastError ?? new BackboardError('Unknown Backboard failure')
}


// PUBLIC API


export async function sendMessage(params: SendMessageParams): Promise<BackboardReply> {
  const { agent, userId, message, context } = params
  const breaker = getBreaker(agent)

  breaker.assertCanRequest()

  try {
    const reply = await requestWithRetry(agent, { userId, message, context })
    breaker.onSuccess()
    return reply
  } catch (err) {

    breaker.onFailure()
    throw err
  }
}

export function getBackboardCircuitState(agent: AgentName): CircuitState {
  return getBreaker(agent).getState()
}