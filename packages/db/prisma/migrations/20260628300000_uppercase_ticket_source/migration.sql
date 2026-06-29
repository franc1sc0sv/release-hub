-- AlterEnum: rename ticket_source values from lowercase to uppercase
BEGIN;
CREATE TYPE "ticket_source_new" AS ENUM ('LINEAR', 'JIRA');
ALTER TABLE "ticket_links" ALTER COLUMN "source" TYPE "ticket_source_new" USING ("source"::text::"ticket_source_new");
ALTER TYPE "ticket_source" RENAME TO "ticket_source_old";
ALTER TYPE "ticket_source_new" RENAME TO "ticket_source";
DROP TYPE "public"."ticket_source_old";
COMMIT;
