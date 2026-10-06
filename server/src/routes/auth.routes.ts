import { Router } from "express";
import { register, login } from "../services/auth.service";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, storeName } = req.body;
    const user = await register(name, email, password, role, storeName);
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Register error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await login(email, password);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Login error" });
  }
});

export default router;
