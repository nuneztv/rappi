import { Router } from "express";
import { verifyToken, onlyRole } from "../middleware/auth";
import { getMyStore, toggleStore, getMyProducts, createProduct, updateProductName } from "../services/store.service";
import { getStoreOrders } from "../services/order.service";

const router = Router();

// todas las rutas de aqui son solo para store
router.use(verifyToken, onlyRole("store"));

router.get("/me", async (req, res) => {
  try {
    const user = (req as any).user;
    const store = await getMyStore(user.id);
    res.json(store);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting store" });
  }
});

router.put("/toggle", async (req, res) => {
  try {
    const user = (req as any).user;
    const store = await toggleStore(user.id);
    res.json(store);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error toggling store" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const user = (req as any).user;
    const products = await getMyProducts(user.id);
    res.json(products);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, price } = req.body;
    const product = await createProduct(user.id, name, Number(price));
    res.json(product);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error creating product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;
    const product = await updateProductName(user.id, Number(req.params.id), name);
    res.json(product);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error updating product" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const user = (req as any).user;
    const orders = await getStoreOrders(user.id);
    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Error getting orders" });
  }
});

export default router;
