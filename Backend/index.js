const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { Prisma } = require("@prisma/client");
dotenv.config();


app.post("/extend", asyn(req,res)=>{
    const body = await Prisma.user
})

app.listen(3000, ()=>{
    console.log("running ..")
})