/*
  Warnings:

  - Added the required column `paymentId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_number` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "vehicle_number" TEXT NOT NULL;
