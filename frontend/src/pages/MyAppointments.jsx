import { useEffect, useState } from "react";
import api from "../services/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await api.get("/appointments/user");
      setAppointments(res.data);
    };
    fetchAppointments();
  }, []);

  {a.status === "approved" && (
  <p className="text-green-700 font-semibold">
    Token: {a.tokenNumber}
  </p>
)}

  return (
    <div>
      <h2>My Appointments</h2>

      {appointments.length === 0 && <p>No appointments yet</p>}

      {appointments.map((a) => (
        <div
          key={a._id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <p><b>Doctor:</b> {a.doctor.username}</p>
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

export default MyAppointments;
