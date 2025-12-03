const express = require("express");
const app = express();
const dotenv = require("dotenv");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
dotenv.config();

const get_method_router = require("./router/get_method_router");
const historyRouter = require("./router/historyRouter");
const bookRouter = require("./router/bookRouter");

app.use(express.json());
//price_per_hour, lat, long
app.get("/", async (req, res) => {
  res.send("working..");
});

app.use("/v1",get_method_router);

app.use("/api", bookRouter);
//lat, long api
app.use("/api",historyRouter);

app.listen(3000, () => {
  console.log("running ..");
});
