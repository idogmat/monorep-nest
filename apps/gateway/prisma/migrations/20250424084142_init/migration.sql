-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedReason" TEXT;
