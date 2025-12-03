const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const DB_latest_booking = async(userId)=>{
    return  await prisma.booking.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: "desc" }, // latest first
      include: {
        slot: {
          include: {
            parkingArea: true, // Access area.name & area.city
          },
        },
      },
    });
}

const DB_find_user = async(userId)=>{
    return await prisma.user.findUnique({
      where: { id: userId },
    });
}

const DB_history = async(userId)=>{
    return await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        slot: {
          include: {
            parkingArea: true,
          },
        },
      },
    });
}

module.exports = {DB_latest_booking,DB_find_user,DB_history}