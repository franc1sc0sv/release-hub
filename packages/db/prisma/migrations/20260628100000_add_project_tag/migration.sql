-- CreateTable
CREATE TABLE "project_tags" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_tags_project_id_deleted_at_idx" ON "project_tags"("project_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_tags_project_id_name_key" ON "project_tags"("project_id", "name");

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
