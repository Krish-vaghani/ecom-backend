import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDb from "./connection/db.js";
import { setupCors } from "./helper/helper.js";
import v1Routes from "./routes/v1/index.js";
import adminRoutes from "./routes/admin/index.js";

dotenv.config();
connectDb();

const app = express();

// Allow larger request bodies (e.g. for uploads via proxy)
const bodyLimit = "150mb";
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
setupCors(app);

app.use("/upload", express.static(path.join(process.cwd(), "upload")));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

app.use("/api", v1Routes);
app.use("/api", adminRoutes);

const port = 4000;
app.listen(port, () => {
  console.log("E-commerce API running on port", port);
});
