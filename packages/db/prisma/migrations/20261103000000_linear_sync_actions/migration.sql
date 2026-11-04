-- CreateEnum
CREATE TYPE "linear_sync_action_kind" AS ENUM ('move_to_production', 'flag_label');

-- CreateEnum
CREATE TYPE "linear_sync_action_status" AS ENUM ('done', 'skipped', 'failed');

-- CreateTable
CREATE TABLE "linear_sync_actions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "release_id" TEXT,
    "tracked_flag_id" TEXT,
    "issue_identifier" TEXT NOT NULL,
    "kind" "linear_sync_action_kind" NOT NULL,
    "status" "linear_sync_action_status" NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "signature" TEXT,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linear_sync_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "linear_sync_actions_release_id_idx" ON "linear_sync_actions"("release_id");

-- CreateIndex
CREATE INDEX "linear_sync_actions_tracked_flag_id_idx" ON "linear_sync_actions"("tracked_flag_id");

-- CreateIndex
CREATE UNIQUE INDEX "linear_sync_actions_project_id_dedupe_key_key" ON "linear_sync_actions"("project_id", "dedupe_key");

-- AddForeignKey
ALTER TABLE "linear_sync_actions" ADD CONSTRAINT "linear_sync_actions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linear_sync_actions" ADD CONSTRAINT "linear_sync_actions_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linear_sync_actions" ADD CONSTRAINT "linear_sync_actions_tracked_flag_id_fkey" FOREIGN KEY ("tracked_flag_id") REFERENCES "tracked_flag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
