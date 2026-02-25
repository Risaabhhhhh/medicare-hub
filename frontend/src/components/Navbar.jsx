import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur border-b z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-700">
          Medicare<span className="text-gray-900">Hub</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link to="#" className="hover:text-green-700">Solutions</Link>
          <Link to="#" className="hover:text-green-700">Features</Link>
          <Link to="#" className="hover:text-green-700">Pricing</Link>

          <Link
            to="/login"
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-6 space-y-4">
          <Link to="#">Solutions</Link>
          <Link to="#">Features</Link>
          <Link to="#">Pricing</Link>

          <Link
            to="/login"
            className="block px-4 py-2 border rounded-lg"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="block px-4 py-2 bg-green-700 text-white rounded-lg text-center"
          >
            Start Free
          </Link>
        </div>
      )}
    </nav>
  );
}
