-- CreateTable
CREATE TABLE `UserUpdateRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` JSON NULL,
    `code` INTEGER NOT NULL,
    `expiry` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
