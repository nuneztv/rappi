import pool from "../db/connection";
import { AppError } from "../errors";

// Consulta base de ordenes (con el nombre de la tienda, del cliente y sus productos)
const selectOrders = `
  SELECT o.id, o.status, o.created_at, o.store_id, o.consumer_id, o.delivery_id,
    s.name AS store_name,
    u.name AS consumer_name,
    (SELECT COALESCE(json_agg(json_build_object('name', p.name, 'price', p.price, 'quantity', oi.quantity)), '[]'::json)
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = o.id) AS items
  FROM orders o
  JOIN stores s ON s.id = o.store_id
  JOIN users u ON u.id = o.consumer_id
`;

// ---------- Cliente ----------

export async function createOrder(consumerId: number, storeId: number, items: any[]) {
  if (!items || items.length === 0) {
    throw new AppError(400, "La orden no tiene productos");
  }

  // validacion de tienda cerrada (tambien se valida en el frontend)
  const storeResult = await pool.query("SELECT * FROM stores WHERE id = $1", [storeId]);

  if (storeResult.rows.length === 0) {
    throw new AppError(404, "Tienda no encontrada");
  }

  if (storeResult.rows[0].is_open === false) {
    throw new AppError(400, "La tienda esta cerrada, no se pueden crear ordenes");
  }

  // revisar que los productos sean de esa tienda y la cantidad sea valida
  for (const item of items) {
    if (!item.quantity || item.quantity < 1) {
      throw new AppError(400, "Cantidad invalida");
    }

    const product = await pool.query(
      "SELECT id FROM products WHERE id = $1 AND store_id = $2",
      [item.productId, storeId]
    );

    if (product.rows.length === 0) {
      throw new AppError(400, "Un producto no pertenece a la tienda");
    }
  }

  const orderResult = await pool.query(
    "INSERT INTO orders (consumer_id, store_id) VALUES ($1,$2) RETURNING *",
    [consumerId, storeId]
  );

  const order = orderResult.rows[0];

  for (const item of items) {
    await pool.query(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,$3)",
      [order.id, item.productId, item.quantity]
    );
  }

  return order;
}

export async function getConsumerOrders(consumerId: number) {
  const result = await pool.query(
    selectOrders + " WHERE o.consumer_id = $1 ORDER BY o.id DESC",
    [consumerId]
  );
  return result.rows;
}

// ---------- Tienda ----------

export async function getStoreOrders(userId: number) {
  const result = await pool.query(
    selectOrders + " WHERE s.user_id = $1 ORDER BY o.id DESC",
    [userId]
  );
  return result.rows;
}

// ---------- Domiciliario ----------

export async function getAvailableOrders() {
  const result = await pool.query(
    selectOrders + " WHERE o.status = 'waiting_for_deliver' AND o.delivery_id IS NULL ORDER BY o.id",
    []
  );
  return result.rows;
}

export async function getMyDeliveryOrders(deliveryId: number) {
  const result = await pool.query(
    selectOrders + " WHERE o.delivery_id = $1 ORDER BY o.id DESC",
    [deliveryId]
  );
  return result.rows;
}

export async function getOrderDetail(orderId: number) {
  const result = await pool.query(selectOrders + " WHERE o.id = $1", [orderId]);

  if (result.rows.length === 0) {
    throw new AppError(404, "Orden no encontrada");
  }

  return result.rows[0];
}

export async function acceptOrder(orderId: number, deliveryId: number) {
  // solo se actualiza si nadie la ha tomado todavia
  const result = await pool.query(
    "UPDATE orders SET delivery_id = $1, status = 'in_progress' WHERE id = $2 AND delivery_id IS NULL AND status = 'waiting_for_deliver' RETURNING *",
    [deliveryId, orderId]
  );

  if (result.rows.length === 0) {
    const exists = await pool.query("SELECT id FROM orders WHERE id = $1", [orderId]);

    if (exists.rows.length === 0) {
      throw new AppError(404, "Orden no encontrada");
    }

    throw new AppError(409, "Esta orden ya fue aceptada por otro domiciliario");
  }

  return result.rows[0];
}

export async function releaseOrder(orderId: number, deliveryId: number) {
  const result = await pool.query(
    "UPDATE orders SET delivery_id = NULL, status = 'waiting_for_deliver' WHERE id = $1 AND delivery_id = $2 AND status = 'in_progress' RETURNING *",
    [orderId, deliveryId]
  );

  if (result.rows.length === 0) {
    throw new AppError(400, "No puedes soltar esta orden");
  }

  return result.rows[0];
}

export async function deliverOrder(orderId: number, deliveryId: number) {
  const result = await pool.query(
    "UPDATE orders SET status = 'delivered' WHERE id = $1 AND delivery_id = $2 AND status = 'in_progress' RETURNING *",
    [orderId, deliveryId]
  );

  if (result.rows.length === 0) {
    throw new AppError(400, "No puedes entregar esta orden");
  }

  return result.rows[0];
}
