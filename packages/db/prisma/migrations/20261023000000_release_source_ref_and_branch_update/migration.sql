CREATE TYPE "branch_update_method" AS ENUM ('rebase', 'merge');

ALTER TABLE "projects" ADD COLUMN "default_parent_branch" TEXT,
ADD COLUMN "branch_update_method" "branch_update_method" NOT NULL DEFAULT 'rebase';

ALTER TABLE "releases" ADD COLUMN "source_ref" TEXT;
