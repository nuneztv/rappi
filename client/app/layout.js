import "./globals.css";
import { UserProvider } from "../context/UserContext";

export const metadata = {
  title: "Rappi Like",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
