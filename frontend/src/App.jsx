import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Memories from "./pages/Memories";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Protected Workspace */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route path="/projects" element={<Projects />} />
        <Route path="/settings" element={<Settings />} />
        <Route
  path="/memories"
  element={<Memories />}
/>
        <Route
  path="/projects/:projectId"
  element={<ProjectWorkspace />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;