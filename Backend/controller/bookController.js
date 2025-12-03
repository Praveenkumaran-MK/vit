
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const book = async (req, res) => {
  try {
    const body = req.body;
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    const area_det = await prisma.parkingArea.findUnique({
      where: { name: body.area },
    });
    const slot_det = await prisma.parkingSlot.findMany({
      where: { parkingId: area_det.id },
      select: { id: true, slotNumber: true },
    });
    let availableSlot = null;

    for (const slot of slot_det) {
      const conflict = await prisma.booking.findFirst({
        where: {
          slotId: slot.id,
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });

      if (!conflict) {
        availableSlot = slot;
        break; // pick the first free slot
      }
    }
    if (!availableSlot) {
      return res.status(200).json({
        reply: "Oops! No slots available at the requested time 😕",
      });
    }

    const book = await prisma.booking.create({
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

    if (!book) {
      res.status(400).json({ message: "Booking Failed" });
    }

    res.status(200).json({
      message: "Booked Successfully",
      data: book,
      area: area_det.name,
      city: area_det.city,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", err: err });
  }
};

const del_book = async (req, res) => {
  try {
    const book_id = Number(req.query.id);

    const book = await prisma.booking.findUnique({ where: { id: book_id } });
    if (!book) {
      res.status(404).json({ message: "Booking details not found" });
    }

    const del_book = await prisma.booking.delete({ where: { id: book_id } });

    res.status(200).json({ message: "Canceled Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

module.exports = {book, del_book}