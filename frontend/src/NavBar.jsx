import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/spring_lab.png";

function NavBar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-[var(--primaryAccent)] text-white px-6 py-3 shadow-md">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SPring Labs Logo"
            className="w-16 h-16 rounded-full"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-xl md:text-2xl font-bold">E-Procura</span>
            <span className="text-xs text-white/80">by SPring Labs</span>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {token ? (
            <>
              {role === "PI" && (
                <Link to="/pi-dashboard" className="hover:underline">
                  PI Dashboard
                </Link>
              )}

              {role === "RND" && (
                <Link to="/rnd-dashboard" className="hover:underline">
                  R&D Dashboard
                </Link>
              )}

              {role === "DORD" && (
                <Link to="/DORD-dashboard" className="hover:underline">
                  DORD Dashboard
                </Link>
              )}

              <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                {name} ({role})
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/" className="hover:underline">
              SignUp/Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
