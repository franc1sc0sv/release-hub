ALTER TYPE "feature_state" ADD VALUE IF NOT EXISTS 'completed';

DO $$ BEGIN
  CREATE TYPE "feature_timeline_scope" AS ENUM ('feature', 'release');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "feature_timeline_source" AS ENUM ('user', 'flag_decision', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "feature_state_events" (
    "id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "release_id" TEXT,
    "scope" "feature_timeline_scope" NOT NULL,
    "source" "feature_timeline_source" NOT NULL,
    "from_state" "feature_state",
    "to_state" "feature_state" NOT NULL,
    "actor_id" TEXT,
    "flag_key" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_state_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "feature_state_events_feature_id_occurred_at_idx" ON "feature_state_events"("feature_id", "occurred_at");

CREATE INDEX IF NOT EXISTS "feature_state_events_release_id_idx" ON "feature_state_events"("release_id");

DO $$ BEGIN
  ALTER TABLE "feature_state_events" ADD CONSTRAINT "feature_state_events_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "feature_state_events" ADD CONSTRAINT "feature_state_events_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "feature_state_events" ADD CONSTRAINT "feature_state_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
