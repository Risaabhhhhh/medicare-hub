import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function SignupModal() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // UPDATED
  const handleSignup = async (userRole) => {

    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role: userRole
      });

      alert("Account created successfully!");
      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center">

      <div className="bg-white w-[420px] rounded-2xl p-8 relative shadow-2xl">

        {/* Close Button */}
        <Link
          to="/"
          className="absolute top-3 right-4 text-gray-400 text-xl hover:text-black"
        >
          ✕
        </Link>

        <h2 className="text-center text-2xl font-bold mb-6 text-green-900">
          Create Your Account
        </h2>

        <form onSubmit={(e) => e.preventDefault()}>

          {/* Username */}
          <label className="block mb-1 text-sm text-gray-600">
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-green-700"
            required
          />

          {/* Email */}
          <label className="block mb-1 text-sm text-gray-600">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-green-700"
            required
          />

          {/* Password */}
          <label className="block mb-1 text-sm text-gray-600">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg outline-none focus:ring-2 focus:ring-green-700"
            required
          />

          {/* PATIENT SIGNUP */}
          <button
            type="button"
            onClick={() => handleSignup("user")}
            className="w-full bg-green-900 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition mb-3"
          >
            Sign Up as Patient
          </button>

          {/* HOSPITAL SIGNUP */}
          <button
            type="button"
            onClick={() => handleSignup("hospital")}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Sign Up as Hospital
          </button>

        </form>

        <div className="text-center mt-4 text-sm text-green-700">
          <Link to="/login">
            Already have an account? Login
          </Link>
        </div>

      </div>

    </div>
  );
}
