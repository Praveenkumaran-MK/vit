const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const DB_area_det = async(body)=>{
 return  await prisma.parkingArea.findUnique({
      where: { name: body.area },
    });
};


const DB_slot_det = async(area_det)=>{
   return await prisma.parkingSlot.findMany({
      where: { parkingId: area_det.id },
      select: { id: true, slotNumber: true },
    });
}

const DB_conflict = async(slot,startTime,endTime)=>{
   return  await prisma.booking.findFirst({
        where: {
          slotId: slot.id,
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });
}

const DB_book = async(body,availableSlot,startTime,endTime)=>{
    return  await prisma.booking.create({
      data: {
        userId: body.id,
        slotId: availableSlot.id,
        startTime,
        endTime,
        phone: body.phone,
        paymentStatus: "pending",
        paymentId: body.paymentId || null,
        vehicle_number: body.vehicle_number,
        amount: body.amount,
      },
    });
}

const DB_find_booking = async(book_id)=>{
    return  await prisma.booking.findUnique({ where: { id: book_id } })
}

const DB_del_book =  async(book_id)=>{
    return await prisma.booking.delete({ where: { id: book_id } });
}

module.exports = {DB_area_det,DB_slot_det,DB_conflict,DB_book,DB_find_booking,DB_del_book};