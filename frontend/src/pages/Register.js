import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("auth/register/", {
        username,
        email,
        password,
      });

      // After successful registration → redirect to login
      navigate("/");
    } catch (err) {
      setError("Registration failed. Try a different username.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="app-title">SplitSmart</h1>
        <p className="subtitle">Create your account</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        <p className="link-text" onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
};

export default Register;
