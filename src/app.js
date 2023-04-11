import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma.js";
import bodyParser from "body-parser";
import cors from "cors";
import auth from "./middlewares/auth.js";
import { socialRouter, userRouter } from "./routes/index.js";
import passport from "passport";
import session from "express-session";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ secret: "SECRET" }));
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["https://app.prolio.xyz", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const port = process.env.port || 4000;

app.use("/user", auth, userRouter);
app.use("/social", socialRouter);

app.get('/', (req, res) => {
  res.send("Unauthorized")
})

app.get("/test", async (req, res) => {
  let user = await prisma.profile.findUnique({
    where: {
      id: "9f34761d-a93f-4a06-bdc1-a5b0826456da"
    }
  })

  res.send(user)
});

app.listen(port, async () => {
  console.log(`Server listening at http://localhost:${port}`);
});
