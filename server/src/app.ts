import express from "express";
import cors from "cors";
import pool from "./db/connection";
import initDB from "./db/initDB";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import storeRoutes from "./routes/store.routes";
import deliveryRoutes from "./routes/delivery.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/delivery", deliveryRoutes);

app.get("/", (req, res) => {
  res.send("Rappi-like API running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
});

const PORT = 4000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error creating tables", error);
  });
