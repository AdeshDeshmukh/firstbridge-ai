export type AgentName = 'vera' | 'grant' | 'atlas'

interface BackboardConfig {
  apiKey: string
  baseUrl: string
  timeoutMs: number
  agentIds: Record<AgentName, string>
}

// Reads a required environment variable.
//  Fails immediately if it is missing.

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim() === '') {
    throw new Error(
      `[Backboard Config] Missing required environment variable: ${name}`
    )
  }

  return value
}

export const backboardConfig: BackboardConfig = {
  apiKey: getRequiredEnv('BACKBOARD_API_KEY'),

  // Uses default if not provided
  baseUrl:
    process.env.BACKBOARD_API_URL ??
    'https://api.backboard.io/v1',

  // Maximum time to wait for Backboard response
  timeoutMs: 15_000,

  agentIds: {
    vera: getRequiredEnv('BACKBOARD_VERA_AGENT_ID'),
    grant: getRequiredEnv('BACKBOARD_GRANT_AGENT_ID'),
    atlas: getRequiredEnv('BACKBOARD_ATLAS_AGENT_ID'),
  },
}

export function getAgentId(agent: AgentName): string {
  const agentId = backboardConfig.agentIds[agent]

  if (!agentId) {
    throw new Error(
      `[Backboard Config] Agent "${agent}" is not configured`
    )
  }

  return agentId
}