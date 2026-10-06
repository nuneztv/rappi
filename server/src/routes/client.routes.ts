import { Router } from "express";
import { verifyToken, onlyRole } from "../middleware/auth";
import { getOpenStores, getStoreWithProducts } from "../services/store.service";
import { createOrder, getConsumerOrders } from "../services/order.service";

const router = Router();

// todas las rutas de aqui son solo para consumer
router.use(verifyToken, onlyRole("consumer"));

router.get("/stores", async (req, res) => {
  try {
    const stores = await getOpenStores();
    res.json(stores);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting stores" });
  }
});

router.get("/stores/:id", async (req, res) => {
  try {
    const data = await getStoreWithProducts(Number(req.params.id));
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting products" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { storeId, items } = req.body;
    const user = (req as any).user;
    const order = await createOrder(user.id, storeId, items);
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error creating order" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const user = (req as any).user;
    const orders = await getConsumerOrders(user.id);
    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting orders" });
  }
});

export default router;
