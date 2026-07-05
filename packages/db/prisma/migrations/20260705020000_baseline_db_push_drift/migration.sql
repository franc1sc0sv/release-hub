-- CreateEnum
CREATE TYPE "ai_draft_status" AS ENUM ('pending', 'running', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "flag_reference_kind" AS ENUM ('DEFINITION', 'USAGE');

-- CreateEnum
CREATE TYPE "release_flag_decision_type" AS ENUM ('ENABLE_IN_RELEASE', 'SHIP_OFF', 'in_progress');

-- CreateEnum
CREATE TYPE "flagsmith_sync_source" AS ENUM ('initial', 'manual', 'webhook');

-- CreateEnum
CREATE TYPE "flagsmith_sync_status" AS ENUM ('running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('email', 'slack_dm', 'in_app');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('release_created', 'release_shipped', 'release_deployed', 'flag_in_progress_reminder', 'flag_staleness_alert', 'flag_digest', 'flag_created', 'flag_deleted', 'flag_enabled', 'flag_disabled', 'flag_value_changed', 'flag_conflict', 'flag_ship_off_reminder');

-- CreateEnum
CREATE TYPE "digest_frequency" AS ENUM ('daily', 'weekly');

-- CreateEnum
CREATE TYPE "flag_history_event_type" AS ENUM ('flag_created', 'flag_deleted', 'flag_enabled', 'flag_disabled', 'flag_value_changed', 'decision_enable_in_release', 'decision_ship_off', 'decision_in_progress', 'conflict_detected', 'reminder_sent', 'sync_completed', 'coverage_scan', 'detected_definition', 'detected_usage', 'first_seen_branch');

-- CreateEnum
CREATE TYPE "flag_history_source" AS ENUM ('webhook', 'sync', 'user', 'system');

-- AlterEnum
BEGIN;
CREATE TYPE "release_status_new" AS ENUM ('draft', 'ready_to_release', 'merged', 'deployed', 'canceled');
ALTER TABLE "public"."releases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "releases" ALTER COLUMN "status" TYPE "release_status_new" USING ("status"::text::"release_status_new");
ALTER TYPE "release_status" RENAME TO "release_status_old";
ALTER TYPE "release_status_new" RENAME TO "release_status";
DROP TYPE "public"."release_status_old";
ALTER TABLE "releases" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- DropForeignKey
ALTER TABLE "linear_connections" DROP CONSTRAINT "linear_connections_user_id_fkey";

-- DropIndex
DROP INDEX "releases_project_id_idx";

-- DropIndex
DROP INDEX "ticket_links_pull_request_id_key";

-- AlterTable
ALTER TABLE "features" DROP COLUMN "category",
ADD COLUMN     "state" "feature_state" NOT NULL DEFAULT 'in_progress',
ADD COLUMN     "suggested" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "linear_api_key",
ADD COLUMN     "conflict_environments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "flag_registry_branch" TEXT,
ADD COLUMN     "flag_registry_path" TEXT,
ADD COLUMN     "flag_reminder_interval_days" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "flag_stale_days" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "flagsmith_project_id" TEXT,
ADD COLUMN     "flagsmith_webhook_secret" TEXT,
ADD COLUMN     "github_webhook_secret" TEXT,
ADD COLUMN     "slack_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pull_requests" ADD COLUMN     "ai_confidence" DOUBLE PRECISION,
ADD COLUMN     "ai_rationale" TEXT,
ADD COLUMN     "pending_addition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "summary_edited_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "releases" DROP COLUMN "tag",
DROP COLUMN "type",
ADD COLUMN     "ai_draft_status" "ai_draft_status" NOT NULL DEFAULT 'pending',
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deployed_at" TIMESTAMP(3),
ADD COLUMN     "github_deployment_id" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_links" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "linear_connections";

-- DropEnum
DROP TYPE "feature_category";

-- CreateTable
CREATE TABLE "project_linear_connections" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "linear_user_id" TEXT NOT NULL,
    "linear_user_name" TEXT NOT NULL,
    "scopes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_linear_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracked_flag" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "feature_id" TEXT,
    "added_in_pull_request_id" TEXT,
    "removed_in_pull_request_id" TEXT,
    "present_in_code" BOOLEAN NOT NULL DEFAULT true,
    "last_reminded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tracked_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_branch_presence" (
    "id" TEXT NOT NULL,
    "tracked_flag_id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "head_sha" TEXT,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flag_branch_presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_request_flag_change" (
    "id" TEXT NOT NULL,
    "pull_request_id" TEXT NOT NULL,
    "tracked_flag_id" TEXT NOT NULL,
    "action" "flag_action" NOT NULL,
    "kind" "flag_reference_kind" NOT NULL DEFAULT 'USAGE',
    "detected_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pull_request_flag_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_flag_decision" (
    "id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "tracked_flag_id" TEXT NOT NULL,
    "decision" "release_flag_decision_type" NOT NULL,
    "decided_by_id" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_flag_decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagsmith_environments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flagsmith_api_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flagsmith_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagsmith_flags" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "flagsmith_feature_id" TEXT,
    "tracked_flag_id" TEXT,
    "flag_created_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flagsmith_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagsmith_flag_states" (
    "id" TEXT NOT NULL,
    "flag_id" TEXT NOT NULL,
    "environment_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flagsmith_flag_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagsmith_sync_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "source" "flagsmith_sync_source" NOT NULL,
    "status" "flagsmith_sync_status" NOT NULL,
    "flag_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "flagsmith_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_slack_connections" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "slack_team_id" TEXT NOT NULL,
    "slack_team_name" TEXT NOT NULL,
    "channel_id" TEXT,
    "channel_name" TEXT,
    "notify_on_created" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_shipped" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_deployed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_slack_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "notification_type" "notification_type" NOT NULL,
    "channel" "notification_channel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "digest_frequency" "digest_frequency",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_branches" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "reason" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_history_events" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "flag_key" TEXT NOT NULL,
    "tracked_flag_id" TEXT,
    "flagsmith_flag_id" TEXT,
    "type" "flag_history_event_type" NOT NULL,
    "environment_name" TEXT,
    "previous_value" TEXT,
    "new_value" TEXT,
    "release_id" TEXT,
    "actor_id" TEXT,
    "branch_name" TEXT,
    "pr_number" INTEGER,
    "detected_file" TEXT,
    "source" "flag_history_source" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flag_history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "flag_key" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_linear_connections_project_id_key" ON "project_linear_connections"("project_id");

-- CreateIndex
CREATE INDEX "tracked_flag_project_id_deleted_at_idx" ON "tracked_flag"("project_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tracked_flag_project_id_key_key" ON "tracked_flag"("project_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "flag_branch_presence_tracked_flag_id_branch_key" ON "flag_branch_presence"("tracked_flag_id", "branch");

-- CreateIndex
CREATE INDEX "pull_request_flag_change_pull_request_id_idx" ON "pull_request_flag_change"("pull_request_id");

-- CreateIndex
CREATE INDEX "pull_request_flag_change_tracked_flag_id_idx" ON "pull_request_flag_change"("tracked_flag_id");

-- CreateIndex
CREATE UNIQUE INDEX "release_flag_decision_release_id_tracked_flag_id_key" ON "release_flag_decision"("release_id", "tracked_flag_id");

-- CreateIndex
CREATE UNIQUE INDEX "flagsmith_environments_project_id_name_key" ON "flagsmith_environments"("project_id", "name");

-- CreateIndex
CREATE INDEX "flagsmith_flags_project_id_deleted_at_idx" ON "flagsmith_flags"("project_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "flagsmith_flags_project_id_key_key" ON "flagsmith_flags"("project_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "flagsmith_flag_states_flag_id_environment_id_key" ON "flagsmith_flag_states"("flag_id", "environment_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_slack_connections_project_id_key" ON "project_slack_connections"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_id_project_id_notificati_key" ON "user_notification_preferences"("user_id", "project_id", "notification_type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_branches_project_id_branch_name_key" ON "blocked_branches"("project_id", "branch_name");

-- CreateIndex
CREATE INDEX "flag_history_events_project_id_flag_key_occurred_at_idx" ON "flag_history_events"("project_id", "flag_key", "occurred_at");

-- CreateIndex
CREATE INDEX "flag_history_events_project_id_occurred_at_idx" ON "flag_history_events"("project_id", "occurred_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "releases_project_id_deleted_at_idx" ON "releases"("project_id", "deleted_at");

-- CreateIndex
CREATE INDEX "ticket_links_pull_request_id_idx" ON "ticket_links"("pull_request_id");

-- AddForeignKey
ALTER TABLE "project_linear_connections" ADD CONSTRAINT "project_linear_connections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_flag" ADD CONSTRAINT "tracked_flag_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_flag" ADD CONSTRAINT "tracked_flag_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_flag" ADD CONSTRAINT "tracked_flag_added_in_pull_request_id_fkey" FOREIGN KEY ("added_in_pull_request_id") REFERENCES "pull_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_flag" ADD CONSTRAINT "tracked_flag_removed_in_pull_request_id_fkey" FOREIGN KEY ("removed_in_pull_request_id") REFERENCES "pull_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_branch_presence" ADD CONSTRAINT "flag_branch_presence_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_request_flag_change" ADD CONSTRAINT "pull_request_flag_change_pull_request_id_fkey" FOREIGN KEY ("pull_request_id") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_request_flag_change" ADD CONSTRAINT "pull_request_flag_change_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_flag_decision" ADD CONSTRAINT "release_flag_decision_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_flag_decision" ADD CONSTRAINT "release_flag_decision_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_flag_decision" ADD CONSTRAINT "release_flag_decision_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_environments" ADD CONSTRAINT "flagsmith_environments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_flags" ADD CONSTRAINT "flagsmith_flags_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_flags" ADD CONSTRAINT "flagsmith_flags_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_flag_states" ADD CONSTRAINT "flagsmith_flag_states_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "flagsmith_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_flag_states" ADD CONSTRAINT "flagsmith_flag_states_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "flagsmith_environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagsmith_sync_runs" ADD CONSTRAINT "flagsmith_sync_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_slack_connections" ADD CONSTRAINT "project_slack_connections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_branches" ADD CONSTRAINT "blocked_branches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_branches" ADD CONSTRAINT "blocked_branches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_history_events" ADD CONSTRAINT "flag_history_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_history_events" ADD CONSTRAINT "flag_history_events_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_history_events" ADD CONSTRAINT "flag_history_events_flagsmith_flag_id_fkey" FOREIGN KEY ("flagsmith_flag_id") REFERENCES "flagsmith_flags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_history_events" ADD CONSTRAINT "flag_history_events_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_history_events" ADD CONSTRAINT "flag_history_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
