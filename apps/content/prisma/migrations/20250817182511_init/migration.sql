/*
  Warnings:

  - Added the required column `message` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "message" TEXT NOT NULL;
