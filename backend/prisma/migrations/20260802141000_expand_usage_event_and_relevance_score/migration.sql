/*
  Warnings:

  - Changed the type of `event_type` on the `usage_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UsageEventType" AS ENUM ('AI_CHAT', 'SCHOLARSHIP', 'INTERVIEW', 'PHOTO', 'PROFILE', 'LOGIN', 'EXPORT');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('VERA', 'GRANT', 'ATLAS');

-- CreateEnum
CREATE TYPE "ChatCategory" AS ENUM ('CAREER', 'SCHOLARSHIP', 'INTERVIEW', 'RESUME', 'LEARNING', 'PLACEMENT', 'HACKATHON', 'CERTIFICATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "ScholarshipAction" AS ENUM ('VIEWED', 'SAVED', 'APPLIED', 'REMOVED');

-- AlterTable
ALTER TABLE "usage_events" ADD COLUMN     "agent" "AgentType",
ADD COLUMN     "chat_category" "ChatCategory",
ADD COLUMN     "interview_id" TEXT,
ADD COLUMN     "interview_score" DOUBLE PRECISION,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "relevance_score" DOUBLE PRECISION,
ADD COLUMN     "response_time_ms" INTEGER,
ADD COLUMN     "scholarship_action" "ScholarshipAction",
ADD COLUMN     "scholarship_id" TEXT,
ADD COLUMN     "session_id" TEXT,
ADD COLUMN     "tokens_used" INTEGER,
DROP COLUMN "event_type",
ADD COLUMN     "event_type" "UsageEventType" NOT NULL;

-- CreateIndex
CREATE INDEX "usage_events_user_id_created_at_idx" ON "usage_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "usage_events_event_type_idx" ON "usage_events"("event_type");

-- CreateIndex
CREATE INDEX "usage_events_agent_idx" ON "usage_events"("agent");
