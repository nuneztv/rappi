"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { request } from "../../lib/api";
import Header from "../../components/Header";

export default function ClientHome() {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "consumer") {
      router.push("/");
      return;
    }

    request("/client/stores", "GET", null, token)
      .then((data) => setStores(data))
      .catch((err) => setError(err.message));
  }, [loading, user]);

  return (
    <div>
      <Header title="Tiendas abiertas" />

      <nav>
        <Link href="/client">Tiendas</Link>
        <Link href="/client/orders">Mis ordenes</Link>
      </nav>

      {error && <p className="error">{error}</p>}
      {stores.length === 0 && <p>No hay tiendas abiertas por ahora</p>}

      {stores.map((store) => (
        <div className="card" key={store.id}>
          <h3>{store.name}</h3>
          <Link href={"/client/store/" + store.id}>Ver productos</Link>
        </div>
      ))}
    </div>
  );
}
