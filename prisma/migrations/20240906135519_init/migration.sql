-- CreateTable
CREATE TABLE `AksiKonvergensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `budgetId` INTEGER NOT NULL,
    `aksi` VARCHAR(255) NOT NULL,
    `hasilPengawasan` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ketersediaan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `budgetId` INTEGER NOT NULL,
    `jenis` VARCHAR(255) NOT NULL,
    `kebutuhan` INTEGER NOT NULL,
    `tersedia` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AksiKonvergensi` ADD CONSTRAINT `AksiKonvergensi_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ketersediaan` ADD CONSTRAINT `Ketersediaan_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
