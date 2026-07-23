-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "university" TEXT,
    "major" TEXT,
    "year" INTEGER,
    "is_first_gen" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT,
    "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "profile_complete" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "consent_version" TEXT NOT NULL DEFAULT '1.0',
    "conversation_storage" BOOLEAN NOT NULL,
    "video_processing" BOOLEAN NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT false,
    "photo_storage" BOOLEAN NOT NULL DEFAULT false,
    "anonymous_analytics" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),

    CONSTRAINT "student_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "stripe_customer_id" TEXT,
    "subscription_status" TEXT NOT NULL DEFAULT 'inactive',
    "subscription_tier" TEXT,
    "subscription_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "student_limit" INTEGER NOT NULL DEFAULT 500,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "eligibility" TEXT,
    "majors" TEXT[],
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_scholarships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "application_status" TEXT NOT NULL DEFAULT 'saved',
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "backboard_id" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "structured_facts" JSONB NOT NULL DEFAULT '{}',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "memory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "question_prompt" TEXT NOT NULL,
    "duration_seconds" INTEGER,
    "storage_key" TEXT,
    "per_frame_scores" JSONB,
    "partial_results" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_scores" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "eye_contact_score" INTEGER,
    "engagement_score" INTEGER,
    "confidence_level" TEXT,
    "filler_word_count" INTEGER,
    "words_per_minute" INTEGER,
    "transcript_text" TEXT,
    "atlas_feedback" TEXT NOT NULL,
    "partial_results" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_breakdowns" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "raw_value" DOUBLE PRECISION NOT NULL,
    "normalized_score" INTEGER,
    "methodology_note" TEXT,

    CONSTRAINT "score_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_enhancements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_key" TEXT,
    "enhanced_key" TEXT,
    "youcam_failed" BOOLEAN NOT NULL DEFAULT false,
    "downloaded" BOOLEAN NOT NULL DEFAULT false,
    "downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distress_signals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message_hash" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL,
    "resource_shown" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distress_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "university_id" TEXT,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nudges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nudge_type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendgrid_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',

    CONSTRAINT "nudges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "request_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "student_profiles_user_id_idx" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "student_consents_user_id_idx" ON "student_consents"("user_id");

-- CreateIndex
CREATE INDEX "student_consents_user_id_withdrawn_at_idx" ON "student_consents"("user_id", "withdrawn_at");

-- CreateIndex
CREATE UNIQUE INDEX "universities_domain_key" ON "universities"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "universities_stripe_customer_id_key" ON "universities"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "universities_stripe_customer_id_idx" ON "universities"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "universities_domain_idx" ON "universities"("domain");

-- CreateIndex
CREATE INDEX "scholarships_deadline_idx" ON "scholarships"("deadline");

-- CreateIndex
CREATE INDEX "scholarships_amount_idx" ON "scholarships"("amount");

-- CreateIndex
CREATE INDEX "scholarships_is_active_idx" ON "scholarships"("is_active");

-- CreateIndex
CREATE INDEX "saved_scholarships_user_id_idx" ON "saved_scholarships"("user_id");

-- CreateIndex
CREATE INDEX "saved_scholarships_user_id_application_status_idx" ON "saved_scholarships"("user_id", "application_status");

-- CreateIndex
CREATE UNIQUE INDEX "saved_scholarships_user_id_scholarship_id_key" ON "saved_scholarships"("user_id", "scholarship_id");

-- CreateIndex
CREATE INDEX "conversations_user_id_agent_type_idx" ON "conversations"("user_id", "agent_type");

-- CreateIndex
CREATE INDEX "conversations_session_id_idx" ON "conversations"("session_id");

-- CreateIndex
CREATE INDEX "conversations_user_id_created_at_idx" ON "conversations"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "memory_snapshots_user_id_key" ON "memory_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "memory_snapshots_user_id_idx" ON "memory_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_idx" ON "interview_sessions"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_status_idx" ON "interview_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_created_at_idx" ON "interview_sessions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "interview_scores_session_id_key" ON "interview_scores"("session_id");

-- CreateIndex
CREATE INDEX "interview_scores_user_id_idx" ON "interview_scores"("user_id");

-- CreateIndex
CREATE INDEX "interview_scores_user_id_created_at_idx" ON "interview_scores"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "score_breakdowns_session_id_idx" ON "score_breakdowns"("session_id");

-- CreateIndex
CREATE INDEX "photo_enhancements_user_id_idx" ON "photo_enhancements"("user_id");

-- CreateIndex
CREATE INDEX "distress_signals_user_id_idx" ON "distress_signals"("user_id");

-- CreateIndex
CREATE INDEX "usage_events_university_id_created_at_idx" ON "usage_events"("university_id", "created_at");

-- CreateIndex
CREATE INDEX "usage_events_event_type_idx" ON "usage_events"("event_type");

-- CreateIndex
CREATE INDEX "nudges_user_id_idx" ON "nudges"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_consents" ADD CONSTRAINT "student_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_snapshots" ADD CONSTRAINT "memory_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_breakdowns" ADD CONSTRAINT "score_breakdowns_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_enhancements" ADD CONSTRAINT "photo_enhancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distress_signals" ADD CONSTRAINT "distress_signals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nudges" ADD CONSTRAINT "nudges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
