/*
  Warnings:

  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('subscribe', 'PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotifyStatus" NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" DROP NOT NULL;
