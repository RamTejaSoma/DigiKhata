import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast"; 

const Login = () => {
  const { token_exp, setToken, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "signUp") {
        const { data } = await axios.post(
          backendUrl + "/api/user/auth/register",
          { name, password, email }
        );

        if (data.success) {
          toast.success("Account created successfully!");
          localStorage.setItem("token_exp", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message || "Registration failed!");
        }

      } else {
        const { data } = await axios.post(
          backendUrl + "/api/user/auth/login",
          { password, email }
        );

        if (data.success) {
          toast.success("Login successful!");
          localStorage.setItem("token_exp", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message || "Invalid credentials!");
        }
      }

    } catch (error) {
      // handle backend 400/500 structured errors
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Something went wrong!");
      }
    }
  };

  const fillGuestCredentials = () => {
    setState("Login");
    setEmail("ram@expense.com");
    setPassword("qwerty123");
    toast("Guest credentials filled!", { icon: "👤" });
  };

  useEffect(() => {
    if (token_exp) navigate("/");
  }, [token_exp]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex justify-center mt-2 items-center bg-violet-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <p className="text-2xl font-bold mb-2 text-gray-800 text-center">
          {state === "signUp" ? "Create Account" : "Login"}
        </p>
        <p className="text-gray-600 text-center mb-6">
          Please {state === "signUp" ? "Create Account" : "Login"} to Add Transaction
        </p>

        {state === "signUp" && (
          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-1">Full Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              value={name}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 font-medium mb-1">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            value={email}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div className="mb-6">
          <p className="text-gray-700 font-medium mb-1">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            value={password}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <button
          type="submit"
          className="bg-violet-500 hover:bg-violet-600 text-white w-full py-2 rounded-md text-base font-medium transition"
        >
          {state === "signUp" ? "Create Account" : "Login"}
        </button>

        {state === "signUp" && (
          <button
            type="button"
            onClick={fillGuestCredentials}
            className="bg-gray-200 text-black w-full py-2 rounded-md text-sm mt-3 font-medium hover:bg-gray-300 transition"
          >
            Use Guest User Credentials
          </button>
        )}

        {state === "signUp" ? (
          <p className="text-center text-gray-700 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-violet-600 hover:text-violet-700 underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-center text-gray-700 mt-4">
            Create a new account?{" "}
            <span
              onClick={() => setState("signUp")}
              className="text-violet-600 hover:text-violet-700 underline cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;