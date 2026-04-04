/*
  Warnings:

  - Added the required column `recipient` to the `NotificationEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationEvent" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "providerMessageId" TEXT,
ADD COLUMN     "recipient" TEXT NOT NULL;
