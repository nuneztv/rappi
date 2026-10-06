"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { request } from "../../../lib/api";
import Header from "../../../components/Header";

export default function DeliveryOrderDetail() {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "delivery") {
      router.push("/");
      return;
    }

    request("/delivery/orders/" + orderId, "GET", null, token)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message));
  }, [loading, user]);

  async function acceptOrder() {
    setError("");
    try {
      await request("/delivery/orders/" + orderId + "/accept", "POST", null, token);
      router.push("/delivery");
    } catch (err) {
      // aqui sale el error si otro domiciliario ya la tomo
      setError(err.message);
    }
  }

  // rechazar = no tomar la orden y volver a la lista
  function rejectOrder() {
    router.push("/delivery");
  }

  return (
    <div>
      <Header title={"Detalle de la orden #" + orderId} />

      <Link href="/delivery">Volver</Link>

      {error && <p className="error">{error}</p>}

      {order && (
        <div className="card">
          <h3>{order.store_name}</h3>
          <p>Cliente: {order.consumer_name}</p>
          <p>Estado: <b>{order.status}</b></p>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>{item.name} x {item.quantity}</li>
            ))}
          </ul>

          <button onClick={acceptOrder}>Aceptar</button>
          <button onClick={rejectOrder}>Rechazar</button>
        </div>
      )}
    </div>
  );
}
