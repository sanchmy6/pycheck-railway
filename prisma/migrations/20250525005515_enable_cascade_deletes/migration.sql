/*
  Warnings:

  - Made the column `description` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `Problem` DROP FOREIGN KEY `Problem_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Course` MODIFY `description` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `Category_name_idx` ON `Category`(`name`);

-- CreateIndex
CREATE INDEX `Course_name_idx` ON `Course`(`name`);

-- CreateIndex
CREATE INDEX `Problem_name_idx` ON `Problem`(`name`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Category` RENAME INDEX `Category_courseId_fkey` TO `Category_courseId_idx`;

-- RenameIndex
ALTER TABLE `Problem` RENAME INDEX `Problem_categoryId_fkey` TO `Problem_categoryId_idx`;
