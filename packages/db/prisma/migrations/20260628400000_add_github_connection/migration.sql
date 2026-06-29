CREATE TABLE "github_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "github_user_id" TEXT NOT NULL,
    "github_login" TEXT NOT NULL,
    "scopes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "github_connections_user_id_key" ON "github_connections"("user_id");

ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
