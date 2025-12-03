const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DB_get_users = async()=>{
    return  await prisma.user.findMany({ include: { bookings: true } });
}
const DB_display_areas = async()=>{
    return await prisma.parkingArea.findMany();
}

module.exports = {DB_get_users,DB_display_areas};