import { useState } from "react";

export default function OvulationCalculator() {

  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [result, setResult] = useState("");

  const calculate = () => {
    if (!lastPeriod || !cycleLength)
      return setResult("Please fill all fields");

    const date = new Date(lastPeriod);
    date.setDate(date.getDate() + Number(cycleLength) - 14);

    setResult(`Estimated Ovulation Date: ${date.toDateString()}`);
  };

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-green-50 to-white">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <span className="text-green-700 font-semibold">WOMEN HEALTH</span>
          <h1 className="text-4xl font-bold mt-2">Ovulation Calculator</h1>
          <p className="text-gray-600 mt-4 max-w-md">
            Estimate your fertile window and plan better.
          </p>

          <img
            src="https://img.freepik.com/free-vector/pregnancy-calendar-concept-illustration_114360-7295.jpg"
            className="w-80 mt-8"
          />
        </div>

        {/* RIGHT */}
        <div className="bg-white/70 backdrop-blur p-10 rounded-3xl shadow-xl max-w-md w-full">

          <input
            type="date"
            className="w-full p-3 mb-4 border rounded-xl focus:outline-green-600"
            onChange={e => setLastPeriod(e.target.value)}
          />

          <input
            type="number"
            placeholder="Cycle Length (days)"
            className="w-full p-3 mb-6 border rounded-xl focus:outline-green-600"
            onChange={e => setCycleLength(e.target.value)}
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

