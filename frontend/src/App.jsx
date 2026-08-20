import { useState } from "react";

import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";

import "./App.css";

export const API = "http://127.0.0.1:5000";


function getRoleFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    // Check token expiry
    if (
      payload.exp &&
      payload.exp * 1000 < Date.now()
    ) {
      localStorage.removeItem("token");
      return null;
    }

    return payload.role?.toUpperCase() || null;

  } catch {
    localStorage.removeItem("token");
    return null;
  }
}


function App() {

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );


  // No token → Login page
  if (!token) {
    return (
      <LoginPage
        onLogin={(newToken) => {
          setToken(newToken);
        }}
      />
    );
  }


  const role = getRoleFromToken(token);


  // Invalid / expired token
  if (!role) {
    return (
      <LoginPage
        onLogin={(newToken) => {
          setToken(newToken);
        }}
      />
    );
  }


  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);
  };


  // ADMIN
  if (role === "ADMIN") {
    return (
      <AdminDashboard
        token={token}
        onLogout={logout}
      />
    );
  }


  // STUDENT
  if (role === "STUDENT") {
    return (
      <StudentDashboard
        token={token}
        onLogout={logout}
      />
    );
  }


  // Unknown role
  localStorage.removeItem("token");

  return (
    <LoginPage
      onLogin={(newToken) => {
        setToken(newToken);
      }}
    />
  );
}


export default App;