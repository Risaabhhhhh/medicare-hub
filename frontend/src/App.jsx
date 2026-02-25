import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

import BmiCalculator from "./components/BmiCalculator";
import OvulationCalculator from "./components/OvulationCalculator";
import HeartRateCalculator from "./components/HeartRateCalculator";
import MapPage from "./pages/MapPage.jsx";
import Profile from "./pages/Profile.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import CreateDoctor from "./pages/CreateDoctor.jsx";
import DoctorOnlyDashboard from "./pages/DoctorOnlyDashboard.jsx";




import UserDashboard from "./pages/UserDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
 import BookAppointment from "./pages/BookAppointment.jsx";


import LoginModal from "./pages/LoginModal";
import SignupModal from "./pages/SignupModal";

function App() {
  return (
    <Routes>


      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Tools Pages */}
      <Route path="/bmi" element={<BmiCalculator />} />
      <Route path="/ovulation" element={<OvulationCalculator />} />
      <Route path="/heartrate" element={<HeartRateCalculator />} />
      <Route path="/dashboard/doctor" element={<DoctorOnlyDashboard />} />


      {/* Landing + Login Modal */}
      <Route
        path="/login"
        element={
          <>
            <Landing />
            <LoginModal />
          </>
        }
      />

      <Route path="/hospital/create-doctor" element={<CreateDoctor />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/book" element={<BookAppointment />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/dashboard/hospital" element={<DoctorDashboard />} />







      <Route path="/dashboard/user" element={<UserDashboard />} />
      <Route path="/dashboard/doctor" element={<DoctorDashboard />} />


      {/* Landing + Signup Modal */}
      <Route
        path="/signup"
        element={
          <>
            <Landing />
            <SignupModal />
          </>
        }
      />

    </Routes>
  );
}

export default App;
