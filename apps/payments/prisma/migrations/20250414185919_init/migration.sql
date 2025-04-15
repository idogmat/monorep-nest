-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CANCEL', 'PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('subscribe', 'PENDING', 'ACTIVE');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(40) NOT NULL,
    "subscriptionId" VARCHAR(40),
    "customerId" VARCHAR(40) NOT NULL,
    "payType" VARCHAR(40) DEFAULT 'Stripe',
    "subType" VARCHAR(40),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "type" "NotifyStatus" NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
