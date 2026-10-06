import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const SECRET = "secreto_rappi_lab";

// Revisa que venga un token valido y guarda el usuario en req.user
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No hay token" });
  }

  const token = header.split(" ")[1];

  try {
    const data = jwt.verify(token, SECRET);
    (req as any).user = data;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalido" });
  }
}

// Solo deja pasar a los usuarios que tengan el rol indicado
export function onlyRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (user.role !== role) {
      return res.status(403).json({ message: "No tienes permiso para esta accion" });
    }

    next();
  };
}
