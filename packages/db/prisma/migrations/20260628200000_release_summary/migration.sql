-- AlterTable
ALTER TABLE "releases" ADD COLUMN "summary" TEXT,
                       ADD COLUMN "summary_edited_at" TIMESTAMP(3);
