-- AlterTable
ALTER TABLE `Course` ADD COLUMN `status` ENUM('Active', 'Archived', 'Private') NOT NULL DEFAULT 'Active';

-- CreateIndex
CREATE INDEX `Course_status_idx` ON `Course`(`status`);
