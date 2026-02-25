import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Profile() {

  const [form, setForm] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    bloodGroup: "",
    allergies: "",
    diseases: "",
    medications: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: ""
  });

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/users/profile");
      setForm({
        ...form,
        ...res.data
      });
    };
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put("/users/profile", form);
    alert("Profile updated successfully");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f3f7f5] p-10">

        <h2 className="text-3xl font-semibold text-green-900 mb-8">
          My Health Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ================= TOP GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* ========= BASIC PROFILE ========= */}
            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-lg font-semibold text-green-800 mb-4">
                My Profile
              </h3>

              <div className="space-y-4">

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="input"
                />

                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="input bg-gray-100"
                />

                <div className="grid grid-cols-2 gap-4">

                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="input"
                  />

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>

                </div>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="input"
                />

                <input
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  placeholder="Blood Group"
                  className="input"
                />

              </div>
            </div>

            {/* ========= MEDICAL INFO ========= */}
            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Medical Information
              </h3>

              <div className="space-y-4">

                <input
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Allergies (comma separated)"
                  className="input"
                />

                <input
                  name="diseases"
                  value={form.diseases}
                  onChange={handleChange}
                  placeholder="Chronic Diseases"
                  className="input"
                />

                <input
                  name="medications"
                  value={form.medications}
                  onChange={handleChange}
                  placeholder="Current Medications"
                  className="input"
                />

              </div>

            </div>

          </div>

          {/* ========= EMERGENCY CONTACT ========= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <input
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
                placeholder="Contact Name"
                className="input"
              />

              <input
                name="emergencyRelation"
                value={form.emergencyRelation}
                onChange={handleChange}
                placeholder="Relation"
                className="input"
              />

              <input
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
                placeholder="Emergency Phone"
                className="input"
              />

            </div>

          </div>

          {/* ========= SAVE BUTTON ========= */}
          <button
            className="bg-green-900 text-white px-10 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
          >
            Save Profile
          </button>

        </form>

      </div>
    </>
  );
}

export default Profile;
