/*
  Warnings:

  - The `amount` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CANCEL', 'PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "amount",
ADD COLUMN     "amount" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
