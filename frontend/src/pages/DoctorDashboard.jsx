import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

function DoctorDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [role, setRole] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [report, setReport] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    const fetchProfileAndAppointments = async () => {

      const profileRes = await api.get("/users/profile");
      setRole(profileRes.data.role);

      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);

      if (profileRes.data.role === "hospital") {
        const docRes = await api.get(
          `/users/doctors/${profileRes.data._id}`
        );
        setDoctors(docRes.data);
      }
    };

    fetchProfileAndAppointments();

  }, []);

  const approveAppointment = async (id) => {
    await api.put(`/appointments/approve/${id}`);
    alert("Appointment Approved");
    window.location.reload();
  };

  const loginAsDoctor = async (doctorId) => {

    const res = await api.post(
      `/hospital-impersonate/login-as-doctor/${doctorId}`
    );

    localStorage.setItem("token", res.data.token);
    window.location.href = "/dashboard/doctor";
  };

  const uploadReport = async (appointmentId) => {
    alert("Report feature coming soon");
  };

  /* ================= STATS ================= */

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === "pending").length;
  const approved = appointments.filter(a => a.status === "approved").length;
  const inProgress = appointments.filter(a => a.status === "in-progress").length;

  const pieData = [
    { name: "Pending", value: pending },
    { name: "Approved", value: approved },
    { name: "In Progress", value: inProgress }
  ];

  const COLORS = ["#facc15", "#22c55e", "#3b82f6"];

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-10">
        <h1 className="text-3xl font-bold text-green-900">
          Doctor Dashboard
        </h1>
        <p className="text-gray-600">
          Manage doctors, patients & appointments
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Total Appointments</p>
          <h2 className="text-3xl font-bold">{total}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-500">{pending}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Approved</p>
          <h2 className="text-3xl font-bold text-green-600">{approved}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">In Progress</p>
          <h2 className="text-3xl font-bold text-blue-600">{inProgress}</h2>
        </div>

      </div>

      {/* ================= CHART + TODAY SUMMARY ================= */}

      <div className="grid md:grid-cols-2 gap-8 mb-10">

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h3 className="text-lg font-semibold mb-4">
            Appointment Status Overview
          </h3>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* TODAY SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h3 className="text-lg font-semibold mb-4">
            Today Summary
          </h3>

          <p>Pending: <b>{pending}</b></p>
          <p>Approved: <b>{approved}</b></p>
          <p>In Progress: <b>{inProgress}</b></p>

        </div>

      </div>

      {/* ================= HOSPITAL CONTROLS ================= */}

      {role === "hospital" && (
        <div className="bg-white p-6 rounded-2xl shadow mb-10 flex flex-wrap gap-4">

          <button
            onClick={() => navigate("/hospital/create-doctor")}
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800"
          >
            + Add Doctor
          </button>

          <button
            onClick={() => alert("Delete Doctor coming soon")}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
          >
            Remove Doctor
          </button>

        </div>
      )}

      {/* ================= DOCTOR LIST ================= */}

      {role === "hospital" && (
        <div className="bg-white p-6 rounded-2xl shadow mb-10">

          <h3 className="text-xl font-semibold mb-6">
            Doctors
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">

            {doctors.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
              >

                <span>{d.username}</span>

                <button
                  onClick={() => loginAsDoctor(d._id)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                >
                  Login
                </button>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* ================= APPOINTMENTS ================= */}

      <h3 className="text-2xl font-semibold mb-6">
        Appointments
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {appointments.map((a) => (

          <div
            key={a._id}
            className="bg-white p-6 rounded-2xl shadow"
          >

            <p><b>Patient:</b> {a.patient ? a.patient.username : "Walk-in"}</p>
            <p><b>Date:</b> {a.date}</p>
            <p><b>Time:</b> {a.time}</p>

            <p className="mt-2">
              <b>Status:</b>{" "}
              <span className="font-semibold capitalize">
                {a.status}
              </span>
            </p>

            {a.status === "pending" && (
              <button
                onClick={() => approveAppointment(a._id)}
                className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800"
              >
                Approve
              </button>
            )}

            {a.status === "approved" && (
              <div className="mt-4">

                <p className="text-green-800 font-semibold">
                  Token: {a.tokenNumber}
                </p>

                <input
                  type="text"
                  placeholder="Paste report link"
                  className="border p-3 rounded-lg w-full mt-2"
                  onChange={(e) => setReport(e.target.value)}
                />

                <button
                  onClick={() => uploadReport(a._id)}
                  className="bg-green-700 text-white py-2 rounded-lg mt-3 w-full hover:bg-green-800"
                >
                  Upload Report
                </button>

              </div>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default DoctorDashboard;
