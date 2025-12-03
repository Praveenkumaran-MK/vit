const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const  {DB_get_users,DB_display_areas} = require("../service/get_method_service");
const get_users = async (req, res) => {
  try {
    const user =await DB_get_users();
    res.json({ message: "Fetched successfully", data: user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err });
  }
}

const display_areas = async (req, res) => {
  try {
    const areas =await  DB_display_areas();
    res
      .status(200)
      .json({ message: "Fetched areas successfully", data: areas });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err });
  }
};

module.exports = {get_users,display_areas}