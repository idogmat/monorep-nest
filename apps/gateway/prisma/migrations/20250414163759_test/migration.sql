/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "NotifyStatus";

-- DropEnum
DROP TYPE "PaymentStatus";
