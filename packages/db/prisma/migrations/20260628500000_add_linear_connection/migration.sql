CREATE TABLE "linear_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "linear_user_id" TEXT NOT NULL,
    "linear_user_name" TEXT NOT NULL,
    "scopes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linear_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "linear_connections_user_id_key" ON "linear_connections"("user_id");

ALTER TABLE "linear_connections" ADD CONSTRAINT "linear_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
