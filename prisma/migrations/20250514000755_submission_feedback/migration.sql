-- CreateTable
CREATE TABLE `AssignmentFeedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment` VARCHAR(191) NULL,
    `mark` DOUBLE NOT NULL,
    `studentSubmissionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AssignmentFeedback` ADD CONSTRAINT `AssignmentFeedback_studentSubmissionId_fkey` FOREIGN KEY (`studentSubmissionId`) REFERENCES `AssignmentSubmission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
