"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header({ title }) {
  const { user, logout } = useUser();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="header">
      <h1>{title}</h1>
      <div>
        <span>{user ? user.name + " (" + user.role + ")" : ""}</span>
        <button onClick={handleLogout}>Cerrar sesion</button>
      </div>
    </div>
  );
}
