"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <ul style={{ display: "flex", gap: "20px", listStyle: "none" }}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/login">Login / Register</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}
