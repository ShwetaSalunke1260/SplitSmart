import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
     localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 🔁 Redirect to login
    navigate("/", { replace: true });
  };

  return (
    <header className="header">
  <h2>SplitSmart</h2>
  <button className="logout-btn" onClick={logout}>Logout</button>
</header>

  );
};

export default Header;
