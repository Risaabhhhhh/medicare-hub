import { useEffect, useState } from "react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";

function BookAppointment() {

  const [searchParams] = useSearchParams();

  // Only for display
  const hospitalFromMap = searchParams.get("hospitalName");

  // REAL SOURCE OF TRUTH
  const hospitalId = localStorage.getItem("userId");

  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // ================= FETCH DOCTORS =================
  useEffect(() => {

    const fetchDoctors = async () => {
      try {

        if (!hospitalId) return;

        const res = await api.get(
          `/users/doctors/${hospitalId}`
        );

        setDoctors(res.data);

      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    fetchDoctors();

  }, [hospitalId]);

  // ================= BOOK APPOINTMENT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctor || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await api.post("/appointments", {
        doctor,
        hospitalId,
        date,
        time
      });

      console.log("Appointment:", res.data);
      alert("Appointment booked successfully!");

      setDoctor("");
      setDate("");
      setTime("");

    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to book appointment");
    }
  };

  return (
    <div style={container}>

      <form style={form} onSubmit={handleSubmit}>

        <h2 style={title}>Book Appointment</h2>

        {/* Hospital */}
        <input
          style={input}
          value={hospitalFromMap || "Selected Hospital"}
          readOnly
        />

        {/* Doctor */}
        <select
          style={input}
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>

          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.username}
            </option>
          ))}

        </select>

        {/* Date */}
        <input
          style={input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Time */}
        <input
          style={input}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button style={button}>
          Book Appointment
        </button>

      </form>

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6fa"
};

const form = {
  background: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  width: "340px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  boxShadow: "0 0 15px rgba(0,0,0,0.1)"
};

const title = {
  textAlign: "center",
  marginBottom: "10px"
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const button = {
  padding: "10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "15px"
};

export default BookAppointment;
