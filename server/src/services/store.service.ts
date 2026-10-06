import pool from "../db/connection";
import { AppError } from "../errors";

// ---------- Cosas del administrador de tienda ----------

export async function getMyStore(userId: number) {
  const result = await pool.query("SELECT * FROM stores WHERE user_id = $1", [userId]);

  if (result.rows.length === 0) {
    throw new AppError(404, "No tienes tienda");
  }

  return result.rows[0];
}

export async function toggleStore(userId: number) {
  const result = await pool.query(
    "UPDATE stores SET is_open = NOT is_open WHERE user_id = $1 RETURNING *",
    [userId]
  );

  return result.rows[0];
}

export async function getMyProducts(userId: number) {
  const store = await getMyStore(userId);

  const result = await pool.query(
    "SELECT * FROM products WHERE store_id = $1 ORDER BY id",
    [store.id]
  );

  return result.rows;
}

export async function createProduct(userId: number, name: string, price: number) {
  if (!name) {
    throw new AppError(400, "El producto necesita nombre");
  }

  const store = await getMyStore(userId);

  const result = await pool.query(
    "INSERT INTO products (store_id, name, price) VALUES ($1,$2,$3) RETURNING *",
    [store.id, name, price || 0]
  );

  return result.rows[0];
}

export async function updateProductName(userId: number, productId: number, name: string) {
  if (!name) {
    throw new AppError(400, "El producto necesita nombre");
  }

  const store = await getMyStore(userId);

  // el AND store_id evita que modifique productos de otra tienda
  const result = await pool.query(
    "UPDATE products SET name = $1 WHERE id = $2 AND store_id = $3 RETURNING *",
    [name, productId, store.id]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Producto no encontrado");
  }

  return result.rows[0];
}

// ---------- Cosas del cliente ----------

// Solo las tiendas abiertas
export async function getOpenStores() {
  const result = await pool.query("SELECT * FROM stores WHERE is_open = true ORDER BY id");
  return result.rows;
}

export async function getStoreWithProducts(storeId: number) {
  const storeResult = await pool.query("SELECT * FROM stores WHERE id = $1", [storeId]);

  if (storeResult.rows.length === 0) {
    throw new AppError(404, "Tienda no encontrada");
  }

  const productsResult = await pool.query(
    "SELECT * FROM products WHERE store_id = $1 ORDER BY id",
    [storeId]
  );

  return { store: storeResult.rows[0], products: productsResult.rows };
}
