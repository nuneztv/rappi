import pool from "../db/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET } from "../middleware/auth";
import { AppError } from "../errors";

export async function register(name: string, email: string, password: string, role: string, storeName: string) {
  if (!name || !email || !password || !role) {
    throw new AppError(400, "Faltan datos");
  }

  if (role !== "consumer" && role !== "store" && role !== "delivery") {
    throw new AppError(400, "Rol invalido");
  }

  if (role === "store" && !storeName) {
    throw new AppError(400, "El storeName es obligatorio para una tienda");
  }

  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) {
    throw new AppError(400, "Ese email ya esta registrado");
  }

  const hash = await bcrypt.hash(password, 10);

  const userResult = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
    [name, email, hash, role]
  );

  const user = userResult.rows[0];

  // si es tienda se crea la tienda automaticamente
  if (role === "store") {
    await pool.query("INSERT INTO stores (name, user_id) VALUES ($1,$2)", [storeName, user.id]);
  }

  return user;
}

export async function login(email: string, password: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (result.rows.length === 0) {
    throw new AppError(401, "Credenciales invalidas");
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    throw new AppError(401, "Credenciales invalidas");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1d" });

  return {
    token: token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
