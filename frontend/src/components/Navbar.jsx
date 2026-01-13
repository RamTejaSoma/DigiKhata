import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FiLogOut, FiLogIn } from "react-icons/fi";

const Navbar = () => {
  const { token_exp, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token_exp");
    navigate("/login");
  };

  const navItems = [
    { label: "General Txn's", path: "/general" },
    { label: "Business Txn's", path: "/business" },
    { label: "Other Txn's", path: "/moneyTransaction" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="bg-violet-50 mt-2 rounded-lg py-2 sm:py-3  shadow-lg border border-violet-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex  items-center justify-between gap-2">
          {/* Left section: App name */}

          <p
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md 
            px-1 py-1 sm:px-3 sm:py-1 
            text-xs sm:text-sm md:text-base 
            cursor-pointer flex-shrink-0 
            shadow hover:scale-105 transform transition-all duration-200"
            onClick={() => navigate("/")}
          >
            <span className="font-bold tracking-wide">
              Digi<span className="text-purple-200">Khata</span>
            </span>
          </p>

          {/* Center / Navigation links */}
          <div className="flex  justify-center flex-grow gap-2">
            {navItems.map((item) => (
              <p
                key={item.path}
                className={`rounded-md px-1 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm md:text-base cursor-pointer font-medium transition-all duration-200 hover:scale-105 transform 
                  ${
                    isActive(item.path)
                      ? "bg-purple-600 text-white shadow-md scale-105"
                      : "bg-violet-200 text-violet-800 hover:bg-purple-500 hover:text-white hover:shadow-md"
                  }`}
                onClick={() => navigate(token_exp ? item.path : "/login")}
              >
                {item.label}
              </p>
            ))}
          </div>

          {/* Right section: Login / Logout */}
          <div className="flex flex-shrink-0 gap-2">
            {token_exp ? (
              <div className="relative group">
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-sm md:text-base font-medium shadow hover:bg-purple-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105 transform "
                >
                  <FiLogOut size={18} />
                </button>
                {/* Tooltip */}
                <div
                  className="absolute top-full right-1/2 transform translate-x-1/2 mt-1 hidden group-hover:block bg-black text-white 
                   text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap z-50 hover:scale-105 "
                >
                  Logout
                </div>
              </div>
            ) : (
              <div className="relative group">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-purple-600 text-white rounded-md px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium shadow hover:bg-purple-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <FiLogIn size={18} />
                </button>
                {/* Tooltip */}
                <div
                  className="absolute top-full right-1/2 transform translate-x-1/2 mt-1 hidden group-hover:block bg-black text-white 
                   text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap z-50"
                >
                  Login
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
