
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {DB_area_det,DB_slot_det,DB_conflict,DB_book,DB_find_booking,DB_del_book} = require("../service/bookService");
const z= require("zod");

const bookShema = z.object({
  id : z.number().int(),
  slotId: z.number().int(),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  phone : z.string(),
  paymentId: z.string(),
  vehicle_number: z.string(),
  amount: z.number(),
  area : z.string()
})



const book = async (req, res) => {
  try {
    const body = bookShema.parse(req.body);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    const area_det = await DB_area_det(body);
    const slot_det = await DB_slot_det(area_det); 
    let availableSlot = null;

    for (const slot of slot_det) {
      const conflict = await DB_conflict(slot,startTime,endTime); 

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

    const book =await DB_book(body,availableSlot,startTime,endTime);

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

    const book = await DB_find_booking(book_id);
    if (!book) {
      res.status(404).json({ message: "Booking details not found" });
    }

    const del_book = await DB_del_book(book_id);

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