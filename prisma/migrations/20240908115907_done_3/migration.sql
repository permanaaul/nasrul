/*
  Warnings:

  - Added the required column `budgetId` to the `SPI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `spi` ADD COLUMN `budgetId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `SPI` ADD CONSTRAINT `SPI_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
