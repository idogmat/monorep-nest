/*
  Warnings:

  - You are about to drop the `_ProfileSubscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProfileSubscriptions" DROP CONSTRAINT "_ProfileSubscriptions_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProfileSubscriptions" DROP CONSTRAINT "_ProfileSubscriptions_B_fkey";

-- DropTable
DROP TABLE "_ProfileSubscriptions";

-- CreateTable
CREATE TABLE "subscriptions" (
    "subscriberId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscriberId","targetUserId")
);

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
