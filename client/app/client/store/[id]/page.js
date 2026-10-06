"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "../../../../context/UserContext";
import { request } from "../../../../lib/api";
import Header from "../../../../components/Header";

export default function StoreProducts() {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const storeId = params.id;

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // { productId: cantidad }
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "consumer") {
      router.push("/");
      return;
    }

    request("/client/stores/" + storeId, "GET", null, token)
      .then((data) => {
        setStore(data.store);
        setProducts(data.products);
      })
      .catch((err) => setError(err.message));
  }, [loading, user]);

  function changeQuantity(productId, value) {
    setQuantities({ ...quantities, [productId]: Number(value) });
  }

  async function createOrder() {
    setError("");
    setMessage("");

    // solo los productos con cantidad mayor a 0
    const items = [];
    for (const product of products) {
      const quantity = quantities[product.id];
      if (quantity > 0) {
        items.push({ productId: product.id, quantity: quantity });
      }
    }

    if (items.length === 0) {
      setError("Selecciona al menos un producto");
      return;
    }

    try {
      await request("/client/orders", "POST", { storeId: Number(storeId), items }, token);
      setMessage("Orden creada correctamente");
      setQuantities({});
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Header title={store ? store.name : "Tienda"} />

      <nav>
        <Link href="/client">Tiendas</Link>
        <Link href="/client/orders">Mis ordenes</Link>
      </nav>

      {store && !store.is_open && (
        <p className="error">Esta tienda esta cerrada, no puedes hacer pedidos</p>
      )}

      {products.length === 0 && <p>Esta tienda no tiene productos</p>}

      {products.map((product) => (
        <div className="card" key={product.id}>
          <b>{product.name}</b> - ${product.price}
          <input
            type="number"
            min="0"
            placeholder="Cantidad"
            value={quantities[product.id] || ""}
            onChange={(e) => changeQuantity(product.id, e.target.value)}
            disabled={!store || !store.is_open}
          />
        </div>
      ))}

      <button onClick={createOrder} disabled={!store || !store.is_open}>
        Crear orden
      </button>

      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}
    </div>
  );
}
