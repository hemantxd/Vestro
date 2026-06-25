import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import {db} from "./db/index.js";
import { users } from "./db/schema/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Vestro Backend Running",
  });
});

app.get("/users", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json(err);
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});