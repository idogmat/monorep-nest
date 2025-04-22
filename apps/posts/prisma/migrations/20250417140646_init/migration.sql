/*
  Warnings:

  - You are about to drop the column `authorId` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the `urls` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "urls" DROP CONSTRAINT "urls_postId_fkey";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "authorId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "urls";

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(900) NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
