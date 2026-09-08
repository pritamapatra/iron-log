-- AlterTable
ALTER TABLE "set_logs" ADD COLUMN     "routineDayItemId" TEXT;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_routineDayItemId_fkey" FOREIGN KEY ("routineDayItemId") REFERENCES "routine_day_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
