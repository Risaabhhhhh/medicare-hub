import { useState } from "react";
import api from "../services/api";

function CreateDoctor() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/hospital/create-doctor", {   // ✅ FIXED HERE
        username,
        email,
        password
      });

      alert("Doctor created successfully");

      setUsername("");
      setEmail("");
      setPassword("");

    } catch (error) {
      console.error(error);
      alert("Failed to create doctor");
    }
  };

  return (
    <div style={container}>
      <form style={form} onSubmit={handleSubmit}>
        <h2>Create Doctor</h2>

        <input
          style={input}
          placeholder="Doctor Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={input}
          placeholder="Doctor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Doctor Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button}>Create Doctor</button>
      </form>
    </div>
  );
}

/* ===== styles ===== */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6fa"
};

const form = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const button = {
  padding: "10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default CreateDoctor;
