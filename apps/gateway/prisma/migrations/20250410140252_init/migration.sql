-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(40) NOT NULL,
    "subscriptionId" VARCHAR(40),
    "customerId" VARCHAR(40) NOT NULL,
    "payType" VARCHAR(40) DEFAULT 'Stripe',
    "subType" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
