/*
  Warnings:

  - A unique constraint covering the columns `[name,courseId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `Category`;

-- CreateIndex
CREATE UNIQUE INDEX `Category_name_courseId_key` ON `Category`(`name`, `courseId`);
