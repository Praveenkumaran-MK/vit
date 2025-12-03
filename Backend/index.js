const express = require("express");
const app = express();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {auth} = require("./middleware/auth");
const get_method_router = require("./router/get_method_router");
const historyRouter = require("./router/historyRouter");
const bookRouter = require("./router/bookRouter");
dotenv.config();
app.use(cookieParser());
app.use(express.json());

//price_per_hour, lat, long
app.get("/", async (req, res) => {
  res.send("working..");
});


app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log(name);

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        isGuest: false,
        feedback: false
      }
    });
  

   

    return res.status(200).json({
      message: "User registered successfully",
      data: user,
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
});


app.post('/login',async(req,res)=>{
  const {email, password} = req.body;

   
   console.log(email);
   //console.log(zoho_visitor_id);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email:email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account does not have a password. Guest login is not supported."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.SESSION_SECRET, { expiresIn: "1h" });
  
      console.log("Token generated in /login");
 res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, 
    sameSite: "Lax",
    maxAge: 3600 * 1000 // 1 hour
});

return res.json({
  message: "Login successful",
  accessToken: accessToken
});



});

app.use(auth);
app.use("/v1",get_method_router);

app.use("/api", bookRouter);
//lat, long api
app.use("/api",historyRouter);

app.listen(3000, () => {
  console.log("running ..");
});
