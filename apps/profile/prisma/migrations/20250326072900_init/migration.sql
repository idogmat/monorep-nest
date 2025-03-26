/*
  Warnings:

  - Made the column `email` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "profiles_userId_key";

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "email" SET NOT NULL;
