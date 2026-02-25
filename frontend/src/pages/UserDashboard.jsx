import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

function UserDashboard() {

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const res = await api.get("/appointments/user");
      setAppointments(res.data);

      if (res.data.length > 0) {
        const first = res.data[0];

        const q = await api.get(
          `/appointments/queue/today?doctorId=${first.doctor._id}&date=${first.date}`
        );

        setQueue(q.data);
      }
    };

    loadData();
  }, []);

  /* ---------- USER METRICS ---------- */

  const totalAppointments = appointments.length;
  const upcoming = appointments.filter(a => a.status === "pending").length;
  const completed = appointments.filter(a => a.status === "completed").length;

  // For demo purpose – later replace with real counts
  const toolsUsed = 6;
  const aiConsults = 3;

  const pieData = [
    { name: "Upcoming", value: upcoming },
    { name: "Completed", value: completed }
  ];

  const COLORS = ["#facc15", "#16a34a"];

  const activityTrend = [
    { name: "Week 1", value: Math.max(totalAppointments - 4, 0) },
    { name: "Week 2", value: Math.max(totalAppointments - 3, 0) },
    { name: "Week 3", value: Math.max(totalAppointments - 2, 0) },
    { name: "Week 4", value: totalAppointments }
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f4f7f6] p-6 md:p-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <h2 className="text-3xl font-bold text-green-900">
            My Health Dashboard
          </h2>
          <p className="text-gray-600">
            Track your health activity & appointments
          </p>
        </div>

        {/* ================= USER STATS ================= */}

        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total Appointments</p>
            <h2 className="text-3xl font-bold">{totalAppointments}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Upcoming Visits</p>
            <h2 className="text-3xl font-bold text-yellow-500">{upcoming}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Completed Visits</p>
            <h2 className="text-3xl font-bold text-green-600">{completed}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Tools Used</p>
            <h2 className="text-3xl font-bold">{toolsUsed}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">AI Consults</p>
            <h2 className="text-3xl font-bold">{aiConsults}</h2>
          </div>

        </div>

        {/* ================= CHARTS ================= */}

        <div className="grid md:grid-cols-2 gap-8 mb-10">

          {/* STATUS PIE */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              Appointment Status
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

          {/* ACTIVITY LINE */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              Your Health Activity
            </h3>

            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ================= TODAY APPOINTMENT ================= */}

        {appointments.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow mb-10">

            <h3 className="text-lg font-semibold mb-4">
              Next Appointment
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <p><b>Doctor:</b> {appointments[0].doctor.username}</p>
              <p><b>Date:</b> {appointments[0].date}</p>
              <p><b>Status:</b> {appointments[0].status}</p>
              <p><b>Token:</b> {appointments[0].tokenNumber}</p>
            </div>

          </div>
        )}

        {/* ================= LIVE QUEUE ================= */}

        {queue.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow mb-10">

            <h3 className="text-lg font-semibold mb-4">
              Live Queue Position
            </h3>

            {queue.map((q, i) => (
              <div
                key={q._id}
                className="flex justify-between py-2 border-b last:border-none"
              >
                <span>Position {i + 1}</span>
                <span className="font-semibold">
                  Token {q.tokenNumber}
                </span>
              </div>
            ))}

          </div>
        )}

        {/* ================= QUICK ACTIONS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          <div onClick={() => navigate("/map")}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition">
            🏥 Find Hospitals
          </div>

          <div onClick={() => navigate("/appointments")}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition">
            📅 Book Appointment
          </div>

          <div onClick={() => navigate("/profile")}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition">
            👤 My Profile
          </div>

          <div onClick={() => navigate("/ai-chat")}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition">
            🤖 Ask AI Doctor
          </div>

        </div>

      </div>
    </>
  );
}

export default UserDashboard;
