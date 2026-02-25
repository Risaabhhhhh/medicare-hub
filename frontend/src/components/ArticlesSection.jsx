import { Link } from "react-router-dom";

export default function ArticlesSection() {

  const articles = [
    {
      title: "What Is an Allergy?",
      desc: "Learn what happens when your immune system overreacts to harmless substances.",
    },
    {
      title: "Who Gets Allergies?",
      desc: "Anyone can develop allergies at any age, from childhood to adulthood.",
    },
    {
      title: "What Causes an Allergic Reaction?",
      desc: "Discover how allergens trigger immune responses inside the body.",
    }
  ];

  return (
    <section className="py-28 bg-white">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT IMAGE */}
        <div className="bg-green-50 rounded-3xl p-10 shadow-lg">
          <img
            src="https://img.freepik.com/free-vector/environmental-protection-concept-illustration_114360-6473.jpg"
            className="w-full"
            alt="Health Education"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div>

          <span className="text-green-700 font-semibold">
            HEALTH EDUCATION
          </span>

          <h2 className="text-4xl font-bold mt-2 mb-8">
            Explore Our Articles
          </h2>

          <div className="space-y-6">

            {articles.map((item, i) => (
              <div
                key={i}
                className="
                bg-white p-6 rounded-2xl shadow-md
                hover:shadow-xl transition
                border
                "
              >
                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-2">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>

          <Link
            to="/articles"
            className="
            inline-block mt-8
            bg-blue-600 text-white
            px-6 py-3 rounded-xl
            font-semibold
            hover:bg-blue-700 transition
            "
          >
            View All Articles
          </Link>

        </div>

      </div>

    </section>
  );
}


