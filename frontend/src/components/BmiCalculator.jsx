import { useState } from "react";

export default function BmiCalculator() {

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState("");

  const calculateBMI = () => {
    if (!height || !weight)
      return setResult("Please enter height and weight");

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    let status = "";
    if (bmi < 18.5) status = "Underweight";
    else if (bmi < 25) status = "Normal";
    else if (bmi < 30) status = "Overweight";
    else status = "Obese";

    setResult(`Your BMI is ${bmi} (${status})`);
  };

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-green-50 to-white">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <span className="text-green-700 font-semibold">HEALTH TOOL</span>
          <h1 className="text-4xl font-bold mt-2">BMI Calculator</h1>
          <p className="text-gray-600 mt-4 max-w-md">
            Understand your body mass index and evaluate your weight category.
          </p>

          <img
            src="https://img.freepik.com/free-vector/healthy-lifestyle-concept-illustration_114360-6554.jpg"
            className="w-80 mt-8"
          />
        </div>

        {/* RIGHT */}
        <div className="bg-white/70 backdrop-blur p-10 rounded-3xl shadow-xl max-w-md w-full">

          <input
            type="number"
            placeholder="Height (cm)"
            className="w-full p-3 mb-4 border rounded-xl focus:outline-green-600"
            onChange={e => setHeight(e.target.value)}
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            className="w-full p-3 mb-6 border rounded-xl focus:outline-green-600"
            onChange={e => setWeight(e.target.value)}
          />

          <button
            onClick={calculateBMI}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Calculate BMI
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
