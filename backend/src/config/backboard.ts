// Stores Backboard AI configuration
import { env } from "./env";

export const backboardConfig = {
  apiKey: env.BACKBOARD_API_KEY,

  agents: {
    vera: env.BACKBOARD_VERA_AGENT_ID,
    grant: env.BACKBOARD_GRANT_AGENT_ID,
    atlas: env.BACKBOARD_ATLAS_AGENT_ID,
  },
};