// Reads environment variables from .env
import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3001,

  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,

  BACKBOARD_API_KEY: process.env.BACKBOARD_API_KEY!,
  BACKBOARD_VERA_AGENT_ID: process.env.BACKBOARD_VERA_AGENT_ID!,
  BACKBOARD_GRANT_AGENT_ID: process.env.BACKBOARD_GRANT_AGENT_ID!,
  BACKBOARD_ATLAS_AGENT_ID: process.env.BACKBOARD_ATLAS_AGENT_ID!,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL!,

  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY!,

  YOUCAM_API_KEY: process.env.YOUCAM_API_KEY!,
  YOUCAM_API_ENDPOINT: process.env.YOUCAM_API_ENDPOINT!,
};