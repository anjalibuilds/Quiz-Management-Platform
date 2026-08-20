import { useState } from "react";
import { API } from "../App";

function LoginPage({ onLogin }) {

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await fetch(
        `${API}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Invalid email or password."
        );

        return;
      }

      const token =
        data.token ||
        data.access_token;

      if (!token) {

        setError(
          "Login successful, but token was not received."
        );

        return;
      }

      localStorage.setItem(
        "token",
        token
      );

      onLogin(token);

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await fetch(
        `${API}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Registration failed."
        );

        return;
      }

      setSuccess(
        "Account created successfully! You can now login."
      );

      setName("");
      setEmail("");
      setPassword("");

      setMode("login");

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await fetch(
        `${API}/api/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to process request."
        );

        return;
      }

      if (data.reset_token) {

        setResetToken(data.reset_token);

        setSuccess(
          "Reset option generated. Create your new password below."
        );

        setMode("reset");

      } else {

        setSuccess(
          data.message
        );

      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await fetch(
        `${API}/api/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Password reset failed."
        );

        return;
      }

      setSuccess(
        "Password reset successfully! You can now login."
      );

      setPassword("");
      setResetToken("");
      setMode("login");

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // MODE SWITCH
  // =====================================================

  const switchMode = (newMode) => {

    setMode(newMode);

    setName("");
    setEmail("");
    setPassword("");

    setResetToken("");

    setError("");
    setSuccess("");
  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="brand-mark">
          Q
        </div>

        <h1>
          Quiz Platform
        </h1>


        <p className="auth-subtitle">

          {mode === "register"
            ? "Create your student account"
            : mode === "forgot"
            ? "Recover your account"
            : mode === "reset"
            ? "Create a new password"
            : "Sign in to continue"}

        </p>


        {/* =================================================
            REGISTER
        ================================================= */}

        {mode === "register" && (

          <form
            onSubmit={handleRegister}
            className="auth-form"
          >

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />


            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              required
            />


            {error && (
              <div className="error-box">
                {error}
              </div>
            )}


            {success && (
              <div className="success-box">
                {success}
              </div>
            )}


            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Student Account"}
            </button>


            <p className="auth-switch">

              Already have an account?

              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login here
              </button>

            </p>

          </form>
        )}


        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        {mode === "forgot" && (

          <form
            onSubmit={handleForgotPassword}
            className="auth-form"
          >

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            {error && (
              <div className="error-box">
                {error}
              </div>
            )}


            {success && (
              <div className="success-box">
                {success}
              </div>
            )}


            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Reset Password"}
            </button>


            <p className="auth-switch">

              Remember your password?

              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login here
              </button>

            </p>

          </form>
        )}


        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        {mode === "reset" && (

          <form
            onSubmit={handleResetPassword}
            className="auth-form"
          >

            <label>
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              required
            />


            {error && (
              <div className="error-box">
                {error}
              </div>
            )}


            {success && (
              <div className="success-box">
                {success}
              </div>
            )}


            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={loading}
            >
              {loading
                ? "Updating Password..."
                : "Set New Password"}
            </button>

          </form>
        )}


        {/* =================================================
            LOGIN
        ================================================= */}

        {mode === "login" && (

          <form
            onSubmit={handleLogin}
            className="auth-form"
          >

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />


            <div
              style={{
                textAlign: "right",
                marginTop: "-4px",
              }}
            >

              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  switchMode("forgot")
                }
              >
                Forgot password?
              </button>

            </div>


            {error && (
              <div className="error-box">
                {error}
              </div>
            )}


            {success && (
              <div className="success-box">
                {success}
              </div>
            )}


            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>


            <p className="auth-switch">

              Don't have an account?

              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  switchMode("register")
                }
              >
                Register here
              </button>

            </p>

          </form>
        )}

      </div>

    </div>
  );
}

export default LoginPage;