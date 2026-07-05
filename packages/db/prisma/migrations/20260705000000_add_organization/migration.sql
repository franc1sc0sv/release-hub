DROP TABLE IF EXISTS "organization_memberships";
DROP TABLE IF EXISTS "organizations";
DROP TYPE IF EXISTS "org_role";

CREATE TYPE "org_role" AS ENUM ('owner', 'member', 'viewer');

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "github_installation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

CREATE TABLE "organization_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "org_role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_memberships_user_id_organization_id_key" ON "organization_memberships"("user_id", "organization_id");
CREATE INDEX "organization_memberships_organization_id_idx" ON "organization_memberships"("organization_id");

ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TEMP TABLE "_owner_org_map" (
    "owner_user_id" TEXT PRIMARY KEY,
    "organization_id" TEXT NOT NULL
);

INSERT INTO "_owner_org_map" ("owner_user_id", "organization_id")
SELECT owners."user_id", gen_random_uuid()::text
FROM (SELECT DISTINCT "user_id" FROM "memberships" WHERE "role" = 'owner') owners;

INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
SELECT map."organization_id",
       u."name" || '''s Workspace',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "_owner_org_map" map
JOIN "users" u ON u."id" = map."owner_user_id";

ALTER TABLE "projects" ADD COLUMN "organization_id" TEXT;

UPDATE "projects" p
SET "organization_id" = map."organization_id"
FROM (
    SELECT DISTINCT ON (m."project_id") m."project_id", m."user_id"
    FROM "memberships" m
    WHERE m."role" = 'owner'
    ORDER BY m."project_id", m."user_id"
) owner_pick
JOIN "_owner_org_map" map ON map."owner_user_id" = owner_pick."user_id"
WHERE owner_pick."project_id" = p."id";

UPDATE "projects" p
SET "organization_id" = map."organization_id"
FROM (
    SELECT DISTINCT ON (m."project_id") m."project_id", m."user_id"
    FROM "memberships" m
    JOIN "_owner_org_map" m2 ON m2."owner_user_id" = m."user_id"
    ORDER BY m."project_id", m."user_id"
) member_pick
JOIN "_owner_org_map" map ON map."owner_user_id" = member_pick."user_id"
WHERE member_pick."project_id" = p."id"
  AND p."organization_id" IS NULL;

CREATE TEMP TABLE "_orphan_org_map" (
    "project_id" TEXT PRIMARY KEY,
    "organization_id" TEXT NOT NULL
);

INSERT INTO "_orphan_org_map" ("project_id", "organization_id")
SELECT p."id", gen_random_uuid()::text
FROM "projects" p
WHERE p."organization_id" IS NULL;

INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
SELECT o."organization_id",
       p."name" || ' Workspace',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "_orphan_org_map" o
JOIN "projects" p ON p."id" = o."project_id";

UPDATE "projects" p
SET "organization_id" = o."organization_id"
FROM "_orphan_org_map" o
WHERE o."project_id" = p."id";

ALTER TABLE "projects" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");

INSERT INTO "organization_memberships" ("id", "user_id", "organization_id", "role", "created_at", "updated_at")
SELECT gen_random_uuid()::text,
       ranked."user_id",
       ranked."organization_id",
       ranked."role",
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM (
    SELECT m."user_id",
           p."organization_id",
           (CASE MAX(CASE m."role" WHEN 'owner' THEN 3 WHEN 'member' THEN 2 WHEN 'viewer' THEN 1 END)
                WHEN 3 THEN 'owner' WHEN 2 THEN 'member' ELSE 'viewer' END)::"org_role" AS "role"
    FROM "memberships" m
    JOIN "projects" p ON p."id" = m."project_id"
    GROUP BY m."user_id", p."organization_id"
) ranked
ON CONFLICT ("user_id", "organization_id") DO UPDATE
SET "role" = EXCLUDED."role",
    "updated_at" = CURRENT_TIMESTAMP
WHERE (CASE EXCLUDED."role" WHEN 'owner' THEN 3 WHEN 'member' THEN 2 WHEN 'viewer' THEN 1 END)
    > (CASE "organization_memberships"."role" WHEN 'owner' THEN 3 WHEN 'member' THEN 2 WHEN 'viewer' THEN 1 END);

ALTER TABLE "invitations" ADD COLUMN "organization_id" TEXT;

UPDATE "invitations" i
SET "organization_id" = p."organization_id"
FROM "projects" p
WHERE p."id" = i."project_id";

ALTER TABLE "invitations" ALTER COLUMN "organization_id" SET NOT NULL;

ALTER TABLE "invitations" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "invitations" ALTER COLUMN "role" TYPE "org_role" USING ("role"::text::"org_role");
ALTER TABLE "invitations" ALTER COLUMN "role" SET DEFAULT 'member';

ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_project_id_fkey";
DROP INDEX IF EXISTS "invitations_project_id_idx";
ALTER TABLE "invitations" DROP COLUMN "project_id";

ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "invitations_organization_id_idx" ON "invitations"("organization_id");

DROP TABLE "memberships";
DROP TYPE "project_role";
