// backend/src/utils/logger.ts

import winston from 'winston'

const { combine, timestamp, json, colorize, simple } = winston.format

// RULE: Never log PII, tokens, passwords, or API keys
// If in doubt, do not log it

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(colorize(), simple())
    })
  ]
})

export default logger