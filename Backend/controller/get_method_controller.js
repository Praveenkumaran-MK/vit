const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const get_users = async (req, res) => {
  try {
    const user = await prisma.user.findMany({ include: { bookings: true } });
    res.json({ message: "Fetched successfully", data: user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err });
  }
}

const display_areas = async (req, res) => {
  try {
    const areas = await prisma.parkingArea.findMany();
    res
      .status(200)
      .json({ message: "Fetched areas successfully", data: areas });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err });
  }
};

module.exports = {get_users,display_areas}