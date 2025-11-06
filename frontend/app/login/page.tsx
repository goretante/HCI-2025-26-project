"use client";

import PageWrapper from "../../components/PageWrapper";
import { useState, FormEvent } from "react";

export default function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Logging in with: ${email}, ${password}`);
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert(`Registering user: ${email}`);
  };

  return (
    <PageWrapper title={isLogin ? "Login" : "Register"}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setIsLogin(true)}
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: isLogin ? "#ddd" : "#f9f9f9",
          }}
        >
          Login
        </button>

        <button
          onClick={() => setIsLogin(false)}
          style={{
            padding: "5px 10px",
            backgroundColor: !isLogin ? "#ddd" : "#f9f9f9",
          }}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" style={{ marginTop: "10px" }}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          <button type="submit" style={{ marginTop: "10px" }}>Register</button>
        </form>
      )}
    </PageWrapper>
  );
}
