import "./globals.css";
import Navbar from "../components/Navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "Goal & Habit Tracker",
  description: "Simple navigation prototype based on sitemap",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}
