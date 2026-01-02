import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("auth/login/", {
        username,
        password,
      });

      // Save tokens
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

 return (
  <div className="auth-wrapper">
    <div className="auth-card">
      <h1 className="app-title">💜SplitSmart</h1>
      <p className="subtitle">🤝 Split expenses. Stay stress-free.</p>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p className="link-text" onClick={() => navigate("/register")}>
        Create a new account
      </p>
    </div>
  </div>
);
}
export default Login;
