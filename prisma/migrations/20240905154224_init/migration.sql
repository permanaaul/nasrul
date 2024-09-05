-- CreateTable
CREATE TABLE `Budget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provinsi` VARCHAR(255) NOT NULL,
    `kabupaten` VARCHAR(255) NOT NULL,
    `opd` VARCHAR(255) NOT NULL,
    `anggaran` INTEGER NOT NULL,
    `realisasi` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
