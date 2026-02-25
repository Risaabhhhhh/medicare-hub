import { useState } from "react";

export default function HeartRateCalculator() {

  const [age, setAge] = useState("");
  const [result, setResult] = useState("");

  const calculate = () => {
    if (!age) return setResult("Please enter age");

    const maxHR = 220 - age;
    const min = Math.round(maxHR * 0.5);
    const max = Math.round(maxHR * 0.85);

    setResult(`Target Heart Rate Zone: ${min} - ${max} BPM`);
  };

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-green-50 to-white">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <span className="text-green-700 font-semibold">FITNESS TOOL</span>
          <h1 className="text-4xl font-bold mt-2">Heart Rate Zone</h1>
          <p className="text-gray-600 mt-4 max-w-md">
            Know your optimal training heart rate.
          </p>

          <img
            src="https://img.freepik.com/free-vector/heartbeat-concept-illustration_114360-4104.jpg"
            className="w-80 mt-8"
          />
        </div>

        {/* RIGHT */}
        <div className="bg-white/70 backdrop-blur p-10 rounded-3xl shadow-xl max-w-md w-full">

          <input
            type="number"
            placeholder="Enter Age"
            className="w-full p-3 mb-6 border rounded-xl focus:outline-green-600"
            onChange={e => setAge(e.target.value)}
          />

          <button
            onClick={calculate}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Calculate
          </button>

          {result && (
            <div className="mt-6 bg-green-100 text-green-900 p-4 rounded-xl text-center font-semibold">
              {result}
            </div>
          )}

        </div>

      </div>

    </section>
  );
}
