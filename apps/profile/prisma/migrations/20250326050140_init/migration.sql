-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "email" TEXT,
    "paymentAccont" BOOLEAN NOT NULL DEFAULT false,
    "userName" TEXT NOT NULL,
    "aboutMe" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
