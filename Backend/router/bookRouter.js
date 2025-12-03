const express = require("express");
const bookRouter = express.Router();


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {book, del_book} = require("../controller/bookController");
bookRouter.post("/book",book );


bookRouter.delete("/book/del", del_book);

module.exports = bookRouter;
