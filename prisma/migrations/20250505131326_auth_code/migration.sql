/*
  Warnings:

  - A unique constraint covering the columns `[authCode]` on the table `MeetingSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `MeetingSession_authCode_key` ON `MeetingSession`(`authCode`);
