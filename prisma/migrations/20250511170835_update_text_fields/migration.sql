-- AlterTable
ALTER TABLE `Problem` MODIFY `description` TEXT NOT NULL,
    MODIFY `correct_reason` TEXT NOT NULL,
    MODIFY `incorrect_reason` TEXT NOT NULL,
    MODIFY `hint` TEXT NOT NULL;
