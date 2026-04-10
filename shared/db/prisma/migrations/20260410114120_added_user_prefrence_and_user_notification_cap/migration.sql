-- CreateEnum
CREATE TYPE "SkipReason" AS ENUM ('CHANNEL_DISABLED', 'FREQUENCY_CAP_REACHED');

-- AlterEnum
ALTER TYPE "EventStatus" ADD VALUE 'SKIPPED';

-- DropForeignKey
ALTER TABLE "NotificationEvent" DROP CONSTRAINT "NotificationEvent_notificationId_fkey";

-- AlterTable
ALTER TABLE "NotificationEvent" ADD COLUMN     "skipReason" "SkipReason";

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
