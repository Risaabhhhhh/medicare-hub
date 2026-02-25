import { Link } from "react-router-dom";

export default function Hero() {
  return (

    
    <section className="min-h-screen flex items-center pt-28 bg-gradient-to-br from-green-50 via-white to-green-100">
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div>
          <span className="inline-block mb-4 px-4 py-1 text-sm rounded-full bg-green-100 text-green-800">
            🏥 Digital Healthcare Platform
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Smarter Healthcare <br />
            Starts with{" "}
            <span className="text-green-700">Medicare Hub</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Book appointments, manage medical records, consult doctors,
            and streamline hospital operations — all in one platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Get Started Free
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 border rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">
          <img
            src="https://img.freepik.com/free-vector/medical-concept-illustration_114360-8456.jpg"
            alt="Healthcare Illustration"
            className="w-full max-w-md mx-auto"
          />

          {/* Floating Stats Card */}
          <div className="absolute top-6 left-6 bg-white p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-500">Patients Served</p>
            <h3 className="text-xl font-bold text-green-700">12,000+</h3>
          </div>

          <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-500">Doctors</p>
            <h3 className="text-xl font-bold text-green-700">350+</h3>
          </div>
        </div>

      </div>
    </section>
  );
}
