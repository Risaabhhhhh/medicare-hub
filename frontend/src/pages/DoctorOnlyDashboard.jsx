import { useEffect, useState } from "react";
import api from "../services/api";

function DoctorOnlyDashboard() {

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {

    const fetchAppointments = async () => {
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);
    };

    fetchAppointments();

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Doctor Dashboard
      </h2>

      {appointments.length === 0 && (
        <p>No appointments yet</p>
      )}

      {appointments.map((a) => (
        <div
          key={a._id}
          style={{
            background: "#fff",
            padding: "15px",
            marginBottom: "12px",
            borderRadius: "8px",
            boxShadow: "0 0 6px rgba(0,0,0,0.1)"
          }}
        >

          <p><b>Patient:</b> {a.patient.username}</p>
          <p><b>Date:</b> {a.date}</p>
          <p><b>Time:</b> {a.time}</p>
          <p><b>Status:</b> {a.status}</p>

          {a.status === "approved" && (
            <p><b>Token:</b> {a.tokenNumber}</p>
          )}

        </div>
      ))}

    </div>
  );
}

export default DoctorOnlyDashboard;
