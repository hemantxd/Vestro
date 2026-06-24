import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import {db} from "./db/index";
import { users } from "./db/schema";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Vestro Backend Running",
  });
});

app.get("/users", async (_req: Request, res: Response) => {
  const result = await db.select().from(users);

  res.json(result);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});