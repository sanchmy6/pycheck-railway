/*
  Warnings:

  - You are about to drop the column `correct_line` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `correct_reason` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `incorrect_reason` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct_lines` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category` ADD COLUMN `courseId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Problem` DROP COLUMN `correct_line`,
    DROP COLUMN `correct_reason`,
    DROP COLUMN `incorrect_reason`,
    ADD COLUMN `correct_lines` TEXT NOT NULL,
    ADD COLUMN `reason` JSON NOT NULL;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
