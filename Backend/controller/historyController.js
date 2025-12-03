const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const latest_booking = async (req, res) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const latestBooking = await prisma.booking.findFirst({
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

    if (!latestBooking) {
      return res.status(404).json({ message: "No bookings found" });
    }

    return res.status(200).json({
      message: "Latest Booking Found",
      booking: {
        bookingId: latestBooking.id,
        area: latestBooking.slot.parkingArea.name,
        city: latestBooking.slot.parkingArea.city,
        startTime: latestBooking.startTime,
        endTime: latestBooking.endTime,
        vehicle_number: latestBooking.vehicle_number,
        amount: latestBooking.amount,
        paymentStatus: latestBooking.paymentStatus,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const history = async (req, res) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const history = await prisma.booking.findMany({
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

    if (!history.length) {
      return res.status(200).json({
        message: "No Booking History Found",
        data: [],
      });
    }

    const formattedHistory = history.map((book) => ({
      bookingId: book.id,
      area: book.slot.parkingArea.name,
      city: book.slot.parkingArea.city,
      slotNumber: book.slot.slotNumber,
      startTime: book.startTime,
      endTime: book.endTime,
      vehicle_number: book.vehicle_number,
      amount: book.amount,
      paymentStatus: book.paymentStatus,
    }));

    return res.status(200).json({
      message: "History Retrieved Successfully",
      data: formattedHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

module.exports = {latest_booking, history}