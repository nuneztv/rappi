"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { request } from "../../../lib/api";
import Header from "../../../components/Header";

export default function ClientOrders() {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "consumer") {
      router.push("/");
      return;
    }

    request("/client/orders", "GET", null, token)
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message));
  }, [loading, user]);

  return (
    <div>
      <Header title="Mis ordenes" />

      <nav>
        <Link href="/client">Tiendas</Link>
        <Link href="/client/orders">Mis ordenes</Link>
      </nav>

      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p>Aun no has hecho ordenes</p>}

      {orders.map((order) => (
        <div className="card" key={order.id}>
          <h3>Orden #{order.id} - {order.store_name}</h3>
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
