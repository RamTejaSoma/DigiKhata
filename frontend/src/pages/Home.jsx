import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FiTrendingUp, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import { MdOutlineCategory } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";

const Home = () => {
  const { token_exp, backendUrl } = useContext(AppContext);

  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const [genData, setGendata] = useState({
    inflow: 0,
    outflow: 0,
    topEntity: null,
    topTransactions: [],
  });
  const [busData, setBusdata] = useState({
    inflow: 0,
    outflow: 0,
    topEntity: null,
    topTransactions: [],
  });
  const [moneyData, setMoneydata] = useState({
    inflow: 0,
    outflow: 0,
    topEntity: null,
    topTransactions: [],
  });
  const [summary, setSummary] = useState({
    inflow: 0,
    outflow: 0,
  });

  const fetchGenData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/segmentSummary/general`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setGendata(data.data);

       // // console.log(data);
      } else {
       // // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //toast.error("Server error. Please try again later.");
    }
  };

  const fetchBusData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/segmentSummary/business`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setBusdata(data.data);

        //// console.log(data);
      } else {
        //// console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //toast.error("Server error. Please try again later.");
    }
  };
  const fetchMoneyData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/segmentSummary/money`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setMoneydata(data.data);

      //  // console.log(data);
      } else {
       // // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
     // toast.error("Server error. Please try again later.");
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/summary`, {
        headers: { token: token_exp },
      });
      if (data.success) {
        setSummary(data.data);

        // console.log(data);
      } else {
        // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
     // toast.error("Server error. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchGenData(),
        fetchBusData(),
        fetchMoneyData(),
        fetchSummary(),
      ]);
    };

    fetchAll();
  }, []);

  const [genFilter, setGenfilter] = useState({});
  const [busFilter, setBusfilter] = useState({});
  const [moneyFilter, setMoneyfilter] = useState({});
  const [summaryFilter, setSummaryfilter] = useState({});

  const summarySubmit = async (e) => {
    e.preventDefault();
    const filtersToSend = {};
    if (summaryFilter.fromDate) {
      filtersToSend.fromDate = summaryFilter.fromDate;
    }
    if (summaryFilter.toDate) {
      filtersToSend.toDate = summaryFilter.toDate;
    }
    try {
      const params = new URLSearchParams(filtersToSend).toString();

      const { data } = await axios.get(
        `${backendUrl}/api/user/summary?${params}`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setSummary(data.data);
        toast.success("Summary filter applied");
        // console.log(data);
      } else {
        // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  const submitFilter = async (e, type) => {
    e.preventDefault();
    let segmentFilter = {};
    if (type === "general") segmentFilter = genFilter;
    else if (type === "business") segmentFilter = busFilter;
    else segmentFilter = moneyFilter;

    const filtersToSend = {};

    if (segmentFilter.fromDate) {
      filtersToSend.fromDate = segmentFilter.fromDate;
    }
    if (segmentFilter.toDate) {
      filtersToSend.toDate = segmentFilter.toDate;
    }
    try {
      const params = new URLSearchParams(filtersToSend).toString();

      const { data } = await axios.get(
        `${backendUrl}/api/user/segmentSummary/${type}?${params}`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        if (type === "general") setGendata(data.data);
        else if (type === "business") setBusdata(data.data);
        else setMoneydata(data.data);
        toast.success("Filter applied");
        // console.log(data);
      } else {
        // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className=" flex flex-col gap-1 mt-2 p-2 rounded-3xl bg-violet-100   overflow-y-auto max-h-[90vh] ">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-lg border ">
        <div className="p-6 flex flex-col gap-6 ">
          {/* TITLE */}
          <div className="flex flex-wrap gap-1 justify-evenly  ">
            <h2 className="text-2xl font-bold text-violet-800  ">
              Overall Summary
            </h2>
            <form
              onSubmit={(e) => summarySubmit(e)}
              className="flex flex-wrap items-end gap-2 bg-gray-50 p-1 rounded-xl border"
            >
              {/* From Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">From :</label>
                <input
                  type="date"
                  value={summaryFilter.fromDate || ""}
                  onChange={(e) =>
                    setSummaryfilter({
                      ...summaryFilter,
                      fromDate: e.target.value,
                    })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">To :</label>
                <input
                  type="date"
                  value={summaryFilter.toDate || ""}
                  onChange={(e) =>
                    setSummaryfilter({
                      ...summaryFilter,
                      toDate: e.target.value,
                    })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                className="h-10 px-6 bg-violet-600 text-white rounded-lg
               hover:bg-violet-700 transition font-medium"
              >
                Apply
              </button>
            </form>
          </div>

          {/* EARNED / SPENT CARDS / TOP ENTITY */}
          <div className="flex justify-evenly gap-1 flex-wrap w-full ">
            <div className="flex gap-2">
              {/* Earned */}
              <div className="flex items-center gap-3 bg-green-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <FiTrendingUp className="text-green-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm  text-gray-500">Earned</p>
                  <p className="text-sm sm:text-lg font-semibold text-green-600">
                    ₹{summary.inflow ?? 0}
                  </p>
                </div>
              </div>

              {/* Spent */}
              <div className="flex items-center gap-3 bg-red-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                  <FiTrendingDown className="text-red-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm  text-gray-500">Spent</p>
                  <p className="text-sm sm:text-lg font-semibold text-red-600">
                    ₹{summary.outflow ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-lg border ">
        {/* LEFT IMAGE / DECOR PANEL
        <div className="relative bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center p-6">
          <img src={general} alt="General" className="w-52 " />
        </div> */}

        {/* RIGHT CONTENT */}
        <div className="p-6 flex flex-col gap-6 ">
          {/* TITLE */}
          <div className="flex flex-wrap gap-1 justify-evenly  ">
            <h2 className="text-2xl font-bold text-violet-800  ">
              General Summary
            </h2>
            <form
              onSubmit={(e) => submitFilter(e, "general")}
              className="flex flex-wrap items-end gap-2 bg-gray-50 p-1 rounded-xl border"
            >
              {/* From Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">From :</label>
                <input
                  type="date"
                  value={genFilter.fromDate || ""}
                  onChange={(e) =>
                    setGenfilter({ ...genFilter, fromDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">To :</label>
                <input
                  type="date"
                  value={genFilter.toDate || ""}
                  onChange={(e) =>
                    setGenfilter({ ...genFilter, toDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                className="h-10 px-6 bg-violet-600 text-white rounded-lg
               hover:bg-violet-700 transition font-medium"
              >
                Apply
              </button>
            </form>
          </div>

          {/* EARNED / SPENT CARDS / TOP ENTITY */}
          <div className="flex justify-evenly gap-1 flex-wrap w-full ">
            <div className="flex gap-2">
              {/* Earned */}
              <div className="flex items-center gap-3 bg-green-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <FiTrendingUp className="text-green-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm  text-gray-500">Earned</p>
                  <p className="text-sm sm:text-lg font-semibold text-green-600">
                    ₹{genData.inflow ?? 0}
                  </p>
                </div>
              </div>

              {/* Spent */}
              <div className="flex items-center gap-3 bg-red-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                  <FiTrendingDown className="text-red-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm  text-gray-500">Spent</p>
                  <p className="text-sm sm:text-lg font-semibold text-red-600">
                    ₹{genData.outflow ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* TOP ENTITY CARD */}
            <div className="bg-violet-50 rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-violet-600" />
                <div>
                  <p className="text-sm  text-gray-500">Top Entity</p>
                  <p className="font-semibold text-violet-700">
                    {genData.topEntity?.name ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="border-l h-10 mx-4" />

              <div className="flex items-center gap-2">
                <HiOutlineCurrencyRupee className="text-violet-600" />
                <div>
                  <p className="text-sm  text-gray-500">Total Amount</p>
                  <p className="text-sm sm:text-lg font-semibold text-violet-700">
                    ₹{genData.topEntity?.amount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-violet-800 flex items-center gap-2">
              <span className="h-5 w-1 bg-violet-600 rounded"></span>
              Top 3 Transactions
            </h3>

            <div className="border rounded-xl overflow-hidden">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <MdOutlineCategory /> Category
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <HiOutlineCurrencyRupee /> Amount
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <AiOutlineCalendar /> Date
                </span>
              </div>

              {/* ROWS */}
              {genData.topTransactions?.length > 0 ? (
                genData.topTransactions.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 border-t items-center"
                  >
                    <span className="font-medium truncate">
                      {item.subCategory}
                    </span>

                    <span
                      className={`text-right font-semibold ${
                        item.type === "spent"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.type === "spent" ? "-" : "+"}₹{item.amount}
                    </span>

                    <span className="text-right text-sm text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  No transactions available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-lg border ">
        {/* LEFT IMAGE / DECOR PANEL
        <div className="relative bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center p-6">
          <img src={general} alt="General" className="w-52 " />
        </div> */}

        {/* RIGHT CONTENT */}
        <div className="p-6 flex flex-col gap-6 ">
          {/* TITLE */}
          <div className="flex flex-wrap gap-1 justify-evenly  ">
            <h2 className="text-2xl font-bold text-violet-800  ">
              Business Summary
            </h2>
            <form
              onSubmit={(e) => submitFilter(e, "business")}
              className="flex flex-wrap items-end gap-2 bg-gray-50 p-1 rounded-xl border"
            >
              {/* From Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">From :</label>
                <input
                  type="date"
                  value={busFilter.fromDate || ""}
                  onChange={(e) =>
                    setBusfilter({ ...busFilter, fromDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">To :</label>
                <input
                  type="date"
                  value={busFilter.toDate || ""}
                  onChange={(e) =>
                    setBusfilter({ ...busFilter, toDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                className="h-10 px-6 bg-violet-600 text-white rounded-lg
               hover:bg-violet-700 transition font-medium"
              >
                Apply
              </button>
            </form>
          </div>

          {/* EARNED / SPENT CARDS / TOP ENTITY */}
          <div className="flex justify-evenly gap-1 flex-wrap w-full ">
            <div className="flex gap-2">
              {/* Earned */}
              <div className="flex items-center gap-3 bg-green-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <FiTrendingUp className="text-green-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">SELL</p>
                  <p className="text-sm sm:text-lg font-semibold text-green-600">
                    ₹{busData.inflow ?? 0}
                  </p>
                </div>
              </div>

              {/* Spent */}
              <div className="flex items-center gap-3 bg-red-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                  <FiTrendingDown className="text-red-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">BUY</p>
                  <p className="text-sm sm:text-lg font-semibold text-red-600">
                    ₹{busData.outflow ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* TOP ENTITY CARD */}
            <div className="bg-violet-50 rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Top Entity</p>
                  <p className="font-semibold text-violet-700">
                    {busData.topEntity?.name ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="border-l h-10 mx-4" />

              <div className="flex items-center gap-2">
                <HiOutlineCurrencyRupee className="text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className=" text-sm sm:text-lg font-semibold text-violet-700">
                    ₹{busData.topEntity?.amount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-violet-800 flex items-center gap-2">
              <span className="h-5 w-1 bg-violet-600 rounded"></span>
              Top 3 Transactions
            </h3>

            <div className="border rounded-xl overflow-hidden">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <MdOutlineCategory /> Category
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <HiOutlineCurrencyRupee /> Amount
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <AiOutlineCalendar /> Date
                </span>
              </div>

              {/* ROWS */}
              {busData.topTransactions?.length > 0 ? (
                busData.topTransactions.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 border-t items-center"
                  >
                    <span className="font-medium truncate">
                      {item.subCategory}
                    </span>

                    <span
                      className={`text-right font-semibold ${
                        item.type === "buy" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.type === "buy" ? "-" : "+"}₹{item.totalCost}
                    </span>

                    <span className="text-right text-sm text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  No transactions available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-lg border ">
        {/* LEFT IMAGE / DECOR PANEL
        <div className="relative bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center p-6">
          <img src={general} alt="General" className="w-52 " />
        </div> */}

        {/* RIGHT CONTENT */}
        <div className="p-6 flex flex-col gap-6 ">
          {/* TITLE */}
          <div className="flex flex-wrap gap-1 justify-evenly  ">
            <h2 className="text-2xl font-bold text-violet-800  ">
              Money Transactions Summary
            </h2>
            <form
              onSubmit={(e) => submitFilter(e, "money")}
              className="flex flex-wrap items-end gap-2 bg-gray-50 p-1 rounded-xl border"
            >
              {/* From Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">From :</label>
                <input
                  type="date"
                  value={moneyFilter.fromDate || ""}
                  onChange={(e) =>
                    setMoneyfilter({ ...moneyFilter, fromDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col text-sm">
                <label className="text-gray-600 mb-1">To :</label>
                <input
                  type="date"
                  value={moneyFilter.toDate || ""}
                  onChange={(e) =>
                    setMoneyfilter({ ...moneyFilter, toDate: e.target.value })
                  }
                  className="px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                className="h-10 px-6 bg-violet-600 text-white rounded-lg
               hover:bg-violet-700 transition font-medium"
              >
                Apply
              </button>
            </form>
          </div>

          {/* EARNED / SPENT CARDS / TOP ENTITY */}
          <div className="flex justify-evenly gap-1 flex-wrap w-full ">
            <div className="flex gap-2">
              {/* Earned */}
              <div className="flex items-center gap-3 bg-green-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <FiTrendingUp className="text-green-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Earned</p>
                  <p className="text-sm sm:text-lg font-semibold text-green-600">
                    ₹{moneyData.inflow ?? 0}
                  </p>
                </div>
              </div>

              {/* Spent */}
              <div className="flex items-center gap-3 bg-red-50 p-2 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                  <FiTrendingDown className="text-red-700 text-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="text-sm sm:text-lg font-semibold text-red-600">
                    ₹{moneyData.outflow ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* TOP ENTITY CARD */}
            <div className="bg-violet-50 rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Top Entity</p>
                  <p className=" font-semibold text-violet-700">
                    {moneyData.topEntity?.name ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="border-l h-10 mx-4" />

              <div className="flex items-center gap-2">
                <HiOutlineCurrencyRupee className="text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-sm sm:text-lg font-semibold text-violet-700">
                    ₹{moneyData.topEntity?.amount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-violet-800 flex items-center gap-2">
              <span className="h-5 w-1 bg-violet-600 rounded"></span>
              Top 3 Transactions
            </h3>

            <div className="border rounded-xl overflow-hidden">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <MdOutlineCategory /> Category
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <HiOutlineCurrencyRupee /> Amount
                </span>
                <span className="text-right flex items-center justify-end gap-1">
                  <AiOutlineCalendar /> Date
                </span>
              </div>

              {/* ROWS */}
              {moneyData.topTransactions?.length > 0 ? (
                moneyData.topTransactions.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 border-t items-center"
                  >
                    <span className="font-medium truncate">
                      {item.entityName}
                    </span>

                    <span
                      className={`text-right font-semibold ${
                        item.transactionType === "given"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.transactionType === "given" ? "-" : "+"}₹
                      {item.amount}
                    </span>

                    <span className="text-right text-sm text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  No transactions available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
