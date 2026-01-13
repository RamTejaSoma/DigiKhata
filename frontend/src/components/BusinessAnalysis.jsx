import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCartPlus,
  FaCartArrowDown,
  FaBoxesStacked,
  FaMoneyBillWave,
  FaTags,
  FaArrowsRotate,
  FaSackDollar,
  FaPercent,
  FaChartLine,
} from "react-icons/fa6";
import { MdArrowOutward, MdArrowDownward, MdTrendingUp } from "react-icons/md";

const BusinessAnalysis = () => {
  const { token_exp, backendUrl, items_bus, fetchBusinessSubcategories } =
    useContext(AppContext);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
   const { item } = useParams();
  

  const [open, setOpen] = useState(false);

  const [summary, setSummary] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({
    subCategory: "All",
    fromDate: "",
    toDate: "",
  });

  const submitFilter = async (e) => {
    e.preventDefault();
    // // console.log("Filter applied:", filter);

    const filtersToSend = {};
    if (filter.subCategory) {
      filtersToSend.subCategory = filter.subCategory;
    }

    if (filter.fromDate) {
      filtersToSend.fromDate = filter.fromDate;
    }
    if (filter.toDate) {
      filtersToSend.toDate = filter.toDate;
    }

    // // console.log("Applying filters:", filtersToSend);

    try {
      const params = new URLSearchParams(filtersToSend).toString();

      const { data } = await axios.get(
        `${backendUrl}/api/business/analysis/filter?${params}`,
        {
          headers: { token: token_exp },
        }
      );

      if (data.success) {
        setSummary(data.summary);
        toast.success("Filter Applied Succesfully");
      } else {
        // // console.log("Error:", data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      toast.error("Server error. Please try again later.");
    }

    setFilter({
      subCategory: "All",

      fromDate: "",
      toDate: "",
    });

    setShowFilter(false);
  };

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/business/analysis/filter?subCategory=${item}`,
        { headers: { token: token_exp } }
      );
      if (data.success) {
        setSummary(data.summary);
       // toast.success("Filter Applied Succesfully");
      } else {
        // // console.log("Error:", data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      toast.error("Server error. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [item]);

  return (
    <div className="p-4 bg-white rounded-2xl flex flex-col shadow-md mt-4">
      <button
        onClick={() => setShowFilter(true)}
        className="bg-purple-600 text-white font-semibold px-2 py-1 rounded-lg shadow-md hover:bg-purple-700 transition-all duration-200"
      >
        Filter
      </button>

      {showFilter && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Filter Transactions
            </h2>
            <form onSubmit={submitFilter} className="flex flex-col gap-4">
              <label className="flex flex-col text-gray-700 font-medium">
                <span>subCategory</span>

                <select
                  value={filter.subCategory}
                  onChange={(e) =>
                    setFilter({ ...filter, subCategory: e.target.value })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value={"All"}>All</option>
                  {items_bus.map((item, index) => {
                    return (
                      <option value={item} key={index}>
                        {item}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="flex flex-col text-gray-700 font-medium flex-1">
                <span>fromDate</span>
                <input
                  value={filter.fromDate}
                  onChange={(e) =>
                    setFilter({ ...filter, fromDate: e.target.value })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                  type="Date"
                />
              </label>
              <label className="flex flex-col text-gray-700 font-medium flex-1">
                <span>toDate</span>
                <input
                  value={filter.toDate}
                  onChange={(e) =>
                    setFilter({ ...filter, toDate: e.target.value })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                  type="Date"
                />
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFilter({
                      subCategory: "All",

                      fromDate: "",
                      toDate: "",
                    });
                    setShowFilter(false);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3 capitalize p-auto mx-auto">
        {item} Summary
      </h2>
      {summary ? (
        <div className="flex flex-col items-center sm:grid grid-cols-2 md:grid-cols-3 gap-3 text-gray-700">
          <p>
            <FaCartPlus className="inline mr-2 text-blue-500" />{" "}
            <b>Total Bought:</b> {summary.totalBought}
          </p>
          <p>
            <FaCartArrowDown className="inline mr-2 text-amber-500" />{" "}
            <b>Total Sold:</b> {summary.totalSold}
          </p>
          <p>
            <FaBoxesStacked className="inline mr-2 text-purple-500" />{" "}
            <b>Total Left:</b> {summary.totalLeft}
          </p>

          <p>
            <FaMoneyBillWave className="inline mr-2 text-green-600" />{" "}
            <b>Avg Buy Price:</b> ₹{summary.avgBuy}
          </p>
          <p>
            <FaTags className="inline mr-2 text-indigo-500" />{" "}
            <b>Avg Sell Price:</b> ₹{summary.avgSell}
          </p>

          <p>
            <MdArrowOutward className="inline mr-2 text-red-500" />{" "}
            <b>Total Expenditure:</b> ₹{summary.totalExpenditure}
          </p>
          <p>
            <MdArrowDownward className="inline mr-2 text-green-600" />{" "}
            <b>Total Income:</b> ₹{summary.totalIncome}
          </p>

          <p>
            <FaArrowsRotate className="inline mr-2 text-sky-600" />{" "}
            <b>Turnover:</b> ₹{summary.turnover}
          </p>
          <p>
            <FaSackDollar className="inline mr-2 text-emerald-600" />{" "}
            <b>Net Profit:</b> ₹{summary.netProfit}
          </p>

          <p>
            <FaPercent className="inline mr-2 text-orange-600" />{" "}
            <b>Profit Margin:</b> {summary.profitMargin}%
          </p>
          <p>
            <MdTrendingUp className="inline mr-2 text-teal-600" />{" "}
            <b>Revenue Efficiency:</b> {summary.revenueEfficiency}%
          </p>

          {/* <p
            className={`font-semibold ${
              summary.stockPosition.includes("🟢")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <FaChartLine className="inline mr-2" /> {summary.stockPosition}
          </p> */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default BusinessAnalysis;
