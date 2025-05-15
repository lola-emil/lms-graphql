/*
  Warnings:

  - The values [DOCUMENT,MD] on the enum `SubjectMaterial_materialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `SubjectMaterial` MODIFY `materialType` ENUM('MODULE', 'QUIZ') NULL;
