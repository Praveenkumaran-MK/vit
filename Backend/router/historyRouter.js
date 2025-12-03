const express = require("express");
const historyRouter = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {latest_booking, history} = require("../controller/historyController");

historyRouter.get("/latest_booking", latest_booking);

historyRouter.get("/history", history);

module.exports = historyRouter;
