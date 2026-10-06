"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { request } from "../lib/api";

export default function Home() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("consumer");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");

  const { login } = useUser();
  const router = useRouter();

  // lleva al usuario a su vista segun el rol
  function redirectByRole(userRole) {
    if (userRole === "consumer") {
      router.push("/client");
    } else if (userRole === "store") {
      router.push("/store-admin");
    } else if (userRole === "delivery") {
      router.push("/delivery");
    }
  }

  async function doLogin(emailValue, passwordValue) {
    const data = await request("/auth/login", "POST", {
      email: emailValue,
      password: passwordValue,
    });

    login(data.user, data.token);
    redirectByRole(data.user.role);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        if (role === "store" && storeName === "") {
          setError("El nombre de la tienda es obligatorio");
          return;
        }

        await request("/auth/register", "POST", {
          name,
          email,
          password,
          role,
          storeName,
        });
      }

      // despues de registrarse tambien se inicia sesion
      await doLogin(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>{isRegister ? "Registro" : "Iniciar sesion"}</h1>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div>
            <input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isRegister && (
          <div>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="consumer">Cliente (consumer)</option>
              <option value="store">Tienda (store)</option>
              <option value="delivery">Domiciliario (delivery)</option>
            </select>
          </div>
        )}

        {isRegister && role === "store" && (
          <div>
            <input
              placeholder="Nombre de la tienda"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
        )}

        <button type="submit">{isRegister ? "Registrarme" : "Entrar"}</button>
      </form>

      {error && <p className="error">{error}</p>}

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Ya tengo cuenta" : "Crear cuenta"}
      </button>
    </div>
  );
}
