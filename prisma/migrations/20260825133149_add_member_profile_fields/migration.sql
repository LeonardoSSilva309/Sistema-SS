-- CreateEnum
CREATE TYPE "MemberCategory" AS ENUM ('REGULAR', 'VIP', 'FOUNDER', 'GUEST');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "category" "MemberCategory" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "monthlyFee" DECIMAL(10,2),
ADD COLUMN     "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "member_notes" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_notes_memberId_idx" ON "member_notes"("memberId");

-- CreateIndex
CREATE INDEX "users_category_idx" ON "users"("category");

-- AddForeignKey
ALTER TABLE "member_notes" ADD CONSTRAINT "member_notes_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_notes" ADD CONSTRAINT "member_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
