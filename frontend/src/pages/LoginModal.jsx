import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function LoginModal() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Login
      const res = await api.post("/auth/login", { email, password });
      localStorage.clear();
localStorage.setItem("token", res.data.token);
localStorage.setItem("userRole", profile.data.role);
localStorage.setItem("userId", profile.data._id);


      // Fetch profile
      const profile = await api.get("/users/profile");

if (profile.data.role === "hospital") {
  navigate("/dashboard/hospital");
}
else if (profile.data.role === "doctor") {
  navigate("/dashboard/doctor");
}
else {
  navigate("/dashboard/user");
}


    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center">

      <div className="bg-white w-[420px] rounded-2xl p-8 relative shadow-2xl">

        {/* Close */}
        <Link
          to="/"
          className="absolute top-3 right-4 text-gray-400 text-xl hover:text-black"
        >
          ✕
        </Link>

        <h2 className="text-center text-2xl font-bold mb-6 text-green-900">
          Login to Medicare Hub
        </h2>

        <form onSubmit={handleLogin}>

          <label className="block mb-1 text-sm text-gray-600">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-green-700"
            required
          />

          <label className="block mb-1 text-sm text-gray-600">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg outline-none focus:ring-2 focus:ring-green-700"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-900 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition"
          >
            Login
          </button>

        </form>

        <div className="flex justify-between mt-4 text-sm text-green-700">
          <Link to="/signup">Create account</Link>
          <span className="cursor-pointer">Forgot password?</span>
        </div>

      </div>

    </div>
  );
}
