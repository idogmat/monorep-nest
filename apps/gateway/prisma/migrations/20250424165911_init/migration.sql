-- CreateTable
CREATE TABLE "super-admins" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "super-admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super-admins_email_key" ON "super-admins"("email");
