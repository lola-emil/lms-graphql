-- CreateTable
CREATE TABLE `ForumDiscussion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherSubjectId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `query` LONGTEXT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commentText` LONGTEXT NOT NULL,
    `createdById` INTEGER NOT NULL,
    `forumDiscussionId` INTEGER NOT NULL,
    `parentCommentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ForumDiscussion` ADD CONSTRAINT `ForumDiscussion_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumComment` ADD CONSTRAINT `ForumComment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumComment` ADD CONSTRAINT `ForumComment_forumDiscussionId_fkey` FOREIGN KEY (`forumDiscussionId`) REFERENCES `ForumDiscussion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumComment` ADD CONSTRAINT `ForumComment_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `ForumComment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
