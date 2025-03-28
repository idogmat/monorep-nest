-- CreateEnum
CREATE TYPE "PhotoUploadStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "photoUploadStatus" "PhotoUploadStatus" NOT NULL DEFAULT 'PENDING';
