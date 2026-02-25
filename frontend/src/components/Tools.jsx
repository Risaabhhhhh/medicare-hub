import { Link } from "react-router-dom";

export default function Tools() {

  const tools = [
    {
      title: "BMI Calculator",
      desc: "Check your body mass index and weight category instantly.",
      path: "/bmi",
      img: "https://img.freepik.com/free-vector/healthy-lifestyle-concept-illustration_114360-6554.jpg"
    },
    {
      title: "Ovulation Calculator",
      desc: "Predict fertile window and plan your pregnancy easily.",
      path: "/ovulation",
      img: "https://img.freepik.com/free-vector/pregnancy-calendar-concept-illustration_114360-7295.jpg"
    },
    {
      title: "Heart Rate Zone",
      desc: "Discover your optimal heart rate training zone.",
      path: "/heartrate",
      img: "https://img.freepik.com/free-vector/heartbeat-concept-illustration_114360-4104.jpg"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-green-50 to-white">

      {/* Heading */}
      <div className="text-center mb-14">
        <span className="text-green-700 font-semibold">
          HEALTH TOOLS
        </span>

        <h2 className="text-4xl font-bold text-gray-900 mt-2">
          Tools, Trackers & Calculators
        </h2>

        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Simple tools to help you understand your body and make healthier decisions.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 px-6">

        {tools.map((tool, i) => (
          <Link key={i} to={tool.path}>
            <div
              className="
              bg-white/70 backdrop-blur
              p-8 rounded-3xl
              shadow-md hover:shadow-xl
              transition-all duration-300
              hover:-translate-y-2
              text-center
              "
            >

              <img
                src={tool.img}
                className="h-44 mx-auto mb-6"
                alt={tool.title}
              />

              <h3 className="text-xl font-semibold text-gray-900">
                {tool.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {tool.desc}
              </p>

              <button className="mt-6 text-green-700 font-semibold hover:underline">
                Try Now →
              </button>

            </div>
          </Link>
        ))}

      </div>

    </section>
  );
}
