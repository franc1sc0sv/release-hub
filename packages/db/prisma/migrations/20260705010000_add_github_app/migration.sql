CREATE TYPE "GithubAuthMode" AS ENUM ('installation', 'oauth');

CREATE TYPE "GithubInstallationStatus" AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE "github_installations" (
    "id" TEXT NOT NULL,
    "installation_id" BIGINT NOT NULL,
    "organization_id" TEXT,
    "account_login" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "account_id" BIGINT NOT NULL,
    "repository_selection" TEXT NOT NULL,
    "status" "GithubInstallationStatus" NOT NULL DEFAULT 'active',
    "suspended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_installations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "github_installations_installation_id_key" ON "github_installations"("installation_id");
CREATE INDEX "github_installations_organization_id_idx" ON "github_installations"("organization_id");

CREATE TABLE "github_installation_repos" (
    "id" TEXT NOT NULL,
    "installation_row_id" TEXT NOT NULL,
    "repo_id" BIGINT NOT NULL,
    "full_name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_installation_repos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "github_installation_repos_installation_row_id_repo_id_key" ON "github_installation_repos"("installation_row_id", "repo_id");
CREATE INDEX "github_installation_repos_full_name_idx" ON "github_installation_repos"("full_name");

CREATE TABLE "github_install_states" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_install_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "github_install_states_nonce_key" ON "github_install_states"("nonce");
CREATE INDEX "github_install_states_expires_at_idx" ON "github_install_states"("expires_at");

ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "github_installation_repos" ADD CONSTRAINT "github_installation_repos_installation_row_id_fkey" FOREIGN KEY ("installation_row_id") REFERENCES "github_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects" ADD COLUMN "github_auth_mode" "GithubAuthMode" NOT NULL DEFAULT 'oauth';
