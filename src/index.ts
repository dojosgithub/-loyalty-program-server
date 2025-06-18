// src/index.ts
import express, { Response } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import {connectToDB} from "./config/db-connection"
import { router } from './router';
import cors from "cors";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
// const HOST = parseInt(process.env.HOST, 10)
const HOST = '0.0.0.0'

// CORS
app.use(
  cors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    // allowedHeaders: [
    //   "Authorization",
    //   "Content-Type",
    //   "Origin",
    //   "Accept",
    //   "Access-Control-Allow-Request-Method",
    // ],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ✅ session must be here BEFORE routes
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // set to true if using https
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(router)

// app.get('/', (_req, res) => {
//   res.send('Hello from TypeScript + MongoDB!');
// });

app.get("/ping", (_req, res) => {
    res.send("Ping successfull 😊");
  });

const startServer = async () => {
  await connectToDB();

  app.listen(PORT,HOST, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
