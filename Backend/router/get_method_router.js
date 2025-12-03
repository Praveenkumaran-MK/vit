const express = require("express");
const get_method_router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {get_users,display_areas} = require("../controller/get_method_controller");
get_method_router.get("/get_users",get_users );

get_method_router.get("/display_areas",display_areas );

module.exports = get_method_router;
