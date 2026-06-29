-- Enforce a single pending invitation per (project, email) at the database level
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_project_id_email_pending_key"
  ON "invitations"("project_id", "email")
  WHERE "status" = 'pending';
