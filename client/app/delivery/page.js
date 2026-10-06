"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { request } from "../../lib/api";
import Header from "../../components/Header";

export default function DeliveryHome() {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setAvailable(await request("/delivery/orders/available", "GET", null, token));
      setMine(await request("/delivery/orders/mine", "GET", null, token));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "delivery") {
      router.push("/");
      return;
    }

    loadData();
  }, [loading, user]);

  async function releaseOrder(id) {
    setError("");
    try {
      await request("/delivery/orders/" + id + "/release", "POST", null, token);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deliverOrder(id) {
    setError("");
    try {
      await request("/delivery/orders/" + id + "/deliver", "POST", null, token);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Header title="Domiciliario" />

      {error && <p className="error">{error}</p>}

      <h2>Ordenes disponibles</h2>
      <button onClick={loadData}>Actualizar</button>
      {available.length === 0 && <p>No hay ordenes disponibles</p>}
      {available.map((order) => (
        <div className="card" key={order.id}>
          <h3>Orden #{order.id} - {order.store_name}</h3>
          <Link href={"/delivery/" + order.id}>Ver detalle</Link>
        </div>
      ))}

      <h2>Mis ordenes (historial)</h2>
      {mine.length === 0 && <p>Aun no has aceptado ordenes</p>}
      {mine.map((order) => (
        <div className="card" key={order.id}>
          <h3>Orden #{order.id} - {order.store_name}</h3>
          <p>Estado: <b>{order.status}</b></p>

          {order.status === "in_progress" && (
            <div>
              <button onClick={() => deliverOrder(order.id)}>Marcar como entregada</button>
              <button onClick={() => releaseOrder(order.id)}>Soltar orden</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
