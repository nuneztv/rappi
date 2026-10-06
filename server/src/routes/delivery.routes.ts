import { Router } from "express";
import { verifyToken, onlyRole } from "../middleware/auth";
import {
  getAvailableOrders,
  getMyDeliveryOrders,
  getOrderDetail,
  acceptOrder,
  releaseOrder,
  deliverOrder,
} from "../services/order.service";

const router = Router();

// todas las rutas de aqui son solo para delivery
router.use(verifyToken, onlyRole("delivery"));

router.get("/orders/available", async (req, res) => {
  try {
    const orders = await getAvailableOrders();
    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting orders" });
  }
});

router.get("/orders/mine", async (req, res) => {
  try {
    const user = (req as any).user;
    const orders = await getMyDeliveryOrders(user.id);
    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting my orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await getOrderDetail(Number(req.params.id));
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting order" });
  }
});

router.post("/orders/:id/accept", async (req, res) => {
  try {
    const user = (req as any).user;
    const order = await acceptOrder(Number(req.params.id), user.id);
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error accepting order" });
  }
});

router.post("/orders/:id/release", async (req, res) => {
  try {
    const user = (req as any).user;
    const order = await releaseOrder(Number(req.params.id), user.id);
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error releasing order" });
  }
});

router.post("/orders/:id/deliver", async (req, res) => {
  try {
    const user = (req as any).user;
    const order = await deliverOrder(Number(req.params.id), user.id);
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error delivering order" });
  }
});

export default router;
