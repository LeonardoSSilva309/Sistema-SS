-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "consumption_transactions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumption_transactions_memberId_idx" ON "consumption_transactions"("memberId");

-- CreateIndex
CREATE INDEX "consumption_transactions_createdAt_idx" ON "consumption_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "consumption_transactions" ADD CONSTRAINT "consumption_transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_transactions" ADD CONSTRAINT "consumption_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
