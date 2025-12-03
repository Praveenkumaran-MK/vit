/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_number` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `ParkingArea` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `ParkingArea` table. All the data in the column will be lost.
  - You are about to drop the column `long` on the `ParkingArea` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_hour` on the `ParkingArea` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zoho_visitor_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "paymentId",
DROP COLUMN "vehicle_number",
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ParkingArea" DROP COLUMN "features",
DROP COLUMN "lat",
DROP COLUMN "long",
DROP COLUMN "price_per_hour";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "zoho_visitor_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_zoho_visitor_id_key" ON "User"("zoho_visitor_id");
