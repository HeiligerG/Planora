-- AlterTable
ALTER TABLE "public"."subjects" ADD COLUMN     "weeklyGoalMinutes" INTEGER NOT NULL DEFAULT 120;

-- CreateIndex
CREATE INDEX "subjects_userId_idx" ON "public"."subjects"("userId");
