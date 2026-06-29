-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "feature_kind" AS ENUM ('product', 'default');

-- CreateEnum
CREATE TYPE "feature_category" AS ENUM ('Product', 'Infra Changes', 'Integration Tests', 'E2E Tests', 'Dev/Chore');

-- CreateEnum
CREATE TYPE "feature_state" AS ENUM ('in_progress', 'shipped_flag_off', 'live_staging', 'live_prod', 'partial', 'fully_released', 'flag_cleanup_pending', 'blocked');

-- CreateEnum
CREATE TYPE "release_type" AS ENUM ('feature', 'hotfix');

-- CreateEnum
CREATE TYPE "release_status" AS ENUM ('draft', 'pr_created', 'merged', 'deployed');

-- CreateEnum
CREATE TYPE "flag_action" AS ENUM ('added', 'modified', 'removed', 'unchanged');

-- CreateEnum
CREATE TYPE "ticket_source" AS ENUM ('linear', 'jira');

-- CreateEnum
CREATE TYPE "project_role" AS ENUM ('owner', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "github_installation_id" TEXT,
    "flagsmith_enabled" BOOLEAN NOT NULL DEFAULT false,
    "linear_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "feature_category" NOT NULL,
    "kind" "feature_kind" NOT NULL DEFAULT 'product',
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base_ref" TEXT NOT NULL,
    "compare_ref" TEXT NOT NULL,
    "type" "release_type" NOT NULL DEFAULT 'feature',
    "status" "release_status" NOT NULL DEFAULT 'draft',
    "pr_url" TEXT,
    "tag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_requests" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "author" TEXT NOT NULL,
    "merged_at" TIMESTAMP(3) NOT NULL,
    "release_id" TEXT NOT NULL,
    "feature_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commits" (
    "id" TEXT NOT NULL,
    "pull_request_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "committed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_in_releases" (
    "id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "state" "feature_state" NOT NULL DEFAULT 'in_progress',
    "flag_staging" BOOLEAN,
    "flag_production" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_in_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_links" (
    "id" TEXT NOT NULL,
    "pull_request_id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "source" "ticket_source" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ticket_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "role" "project_role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "project_role" NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "status" "invitation_status" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "login_codes_user_id_consumed_at_idx" ON "login_codes"("user_id", "consumed_at");

-- CreateIndex
CREATE INDEX "login_codes_expires_at_idx" ON "login_codes"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "features_project_id_deleted_at_idx" ON "features"("project_id", "deleted_at");

-- CreateIndex
CREATE INDEX "releases_project_id_idx" ON "releases"("project_id");

-- CreateIndex
CREATE INDEX "pull_requests_release_id_idx" ON "pull_requests"("release_id");

-- CreateIndex
CREATE INDEX "pull_requests_feature_id_idx" ON "pull_requests"("feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "pull_requests_release_id_number_key" ON "pull_requests"("release_id", "number");

-- CreateIndex
CREATE INDEX "commits_pull_request_id_idx" ON "commits"("pull_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "commits_pull_request_id_sha_key" ON "commits"("pull_request_id", "sha");

-- CreateIndex
CREATE INDEX "feature_in_releases_release_id_idx" ON "feature_in_releases"("release_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_in_releases_feature_id_release_id_key" ON "feature_in_releases"("feature_id", "release_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_links_pull_request_id_key" ON "ticket_links"("pull_request_id");

-- CreateIndex
CREATE INDEX "memberships_project_id_idx" ON "memberships"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_project_id_key" ON "memberships"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_project_id_idx" ON "invitations"("project_id");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- AddForeignKey
ALTER TABLE "login_codes" ADD CONSTRAINT "login_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_pull_request_id_fkey" FOREIGN KEY ("pull_request_id") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_in_releases" ADD CONSTRAINT "feature_in_releases_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_in_releases" ADD CONSTRAINT "feature_in_releases_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_links" ADD CONSTRAINT "ticket_links_pull_request_id_fkey" FOREIGN KEY ("pull_request_id") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
