import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import General from "./pages/General";
import GeneralAdd from "./pages/GeneralAdd";
import GeneralItem from "./pages/GeneralItem";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Business from "./pages/Business";
import BusinessAdd from "./pages/BusinessAdd";
import BusinessItem from "./pages/BusinessItem";
import MoneyTxn from "./pages/MoneyTxn";
import MoneyTxnAdd from "./pages/MoneyTxnAdd";
import MoneyTxnItem from "./pages/MoneyTxnItem";

const App = () => {
  return (
    <div className="mx-4  sm:mx-[5%] ">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/general" element={<General />} />
        <Route path="/general/add" element={<GeneralAdd />} />;
        <Route path="/general/:item" element={<GeneralItem />} />;
        <Route path="/business" element={<Business />} />
        <Route path="/business/add" element={<BusinessAdd />} />;
        <Route path="/business/:item" element={<BusinessItem />} />;
        <Route path="/moneyTransaction" element={<MoneyTxn />} />
        <Route path="/moneyTransaction/add" element={<MoneyTxnAdd />} />;
        <Route path="/moneyTransaction/:item" element={<MoneyTxnItem />} />;
      </Routes>
    </div>
  );
};

export default App;
