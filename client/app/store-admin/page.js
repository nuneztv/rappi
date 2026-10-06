"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { request } from "../../lib/api";
import Header from "../../components/Header";

export default function StoreAdmin() {
  const { user, token, loading } = useUser();
  const router = useRouter();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editNames, setEditNames] = useState({}); // { productId: nombre nuevo }
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setStore(await request("/store/me", "GET", null, token));
      setProducts(await request("/store/products", "GET", null, token));
      setOrders(await request("/store/orders", "GET", null, token));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "store") {
      router.push("/");
      return;
    }

    loadData();
  }, [loading, user]);

  async function toggleStore() {
    try {
      const data = await request("/store/toggle", "PUT", null, token);
      setStore(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createProduct(e) {
    e.preventDefault();
    setError("");

    try {
      await request("/store/products", "POST", { name: newName, price: newPrice }, token);
      setNewName("");
      setNewPrice("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateProduct(product) {
    setError("");
    const name = editNames[product.id];

    if (!name) {
      setError("Escribe el nuevo nombre");
      return;
    }

    try {
      await request("/store/products/" + product.id, "PUT", { name }, token);
      setEditNames({ ...editNames, [product.id]: "" });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Header title="Administrador de tienda" />

      {error && <p className="error">{error}</p>}

      {store && (
        <div className="card">
          <h2>{store.name}</h2>
          <p>Estado: <b>{store.is_open ? "Abierta" : "Cerrada"}</b></p>
          <button onClick={toggleStore}>
            {store.is_open ? "Cerrar tienda" : "Abrir tienda"}
          </button>
        </div>
      )}

      <h2>Crear producto</h2>
      <form onSubmit={createProduct}>
        <input
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <button type="submit">Crear</button>
      </form>

      <h2>Mis productos</h2>
      {products.length === 0 && <p>No tienes productos</p>}
      {products.map((product) => (
        <div className="card" key={product.id}>
          <b>{product.name}</b> - ${product.price}
          <input
            placeholder="Nuevo nombre"
            value={editNames[product.id] || ""}
            onChange={(e) => setEditNames({ ...editNames, [product.id]: e.target.value })}
          />
          <button onClick={() => updateProduct(product)}>Actualizar nombre</button>
        </div>
      ))}

      <h2>Ordenes de mi tienda</h2>
      {orders.length === 0 && <p>No hay ordenes</p>}
      {orders.map((order) => (
        <div className="card" key={order.id}>
          <h3>Orden #{order.id} - Cliente: {order.consumer_name}</h3>
          <p>Estado: <b>{order.status}</b></p>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>{item.name} x {item.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
