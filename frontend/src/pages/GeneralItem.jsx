import React from "react";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const GeneralItem = () => {
  const { token_exp, backendUrl, items, fetchSubcategories } =
    useContext(AppContext);
  const { item } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);

  const isActive = (category) => category === item;

  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/general/subcategory/${item}`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setTransactions(data.data);
        //// console.log(transactions);
       // // console.log(data);
      } else {
      //  // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  useEffect(() => {
   // // console.log("Transactions updated:", transactions);
  }, [transactions]);

  // Format date like "12 Mar 2025"
  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({
    subCategory: item,
    type: "All",
    fromDate: "",
    toDate: "",
  });
  const submitFilter = async (e) => {
    e.preventDefault();
    //// console.log("Filter applied:", filter);

    const filtersToSend = {};
    if (filter.subCategory) {
      filtersToSend.subCategory = filter.subCategory;
    }
    if (filter.type) {
      filtersToSend.type = filter.type;
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
        `${backendUrl}/api/general/filter?${params}`,
        {
          headers: { token: token_exp },
        }
      );

      if (data.success) {
        setTransactions(data.data);
        fetchGenData();
        toast.success("Filter Applied Succesfully");
      } else {
      //  // console.log("Error:", data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      toast.error("Server error. Please try again later.");
    }
   

    setShowFilter(false);
  };

  const deleteTransaction = async (id) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/general/delete/${id}`,
        { headers: { token: token_exp } }
      );
      if (data.success) {
        // fetchSubcategories();
        // fetchTransactions();
        await Promise.all([fetchTransactions(), fetchSubcategories()]);

        toast.success("Transaction deleted successfully!");
      } else {
        //// console.log(data.message);
        toast.error(data.message);
      }
    } catch (err) {
     // console.error("Error fetching data:", err);
      toast.error("Server error. Please try again later.");
    }
  };

  const [genData, setGendata] = useState({
    inflow: 0,
    outflow: 0,
  });

  const fetchGenData = async () => {
    const filtersToSend = {};
    if (filter.subCategory) {
      filtersToSend.subCategory = filter.subCategory;
    }
    if (filter.type) {
      filtersToSend.type = filter.type;
    }
    if (filter.fromDate) {
      filtersToSend.fromDate = filter.fromDate;
    }
    if (filter.toDate) {
      filtersToSend.toDate = filter.toDate;
    }
    try {
      const params = new URLSearchParams(filtersToSend).toString();
      const { data } = await axios.get(
        `${backendUrl}/api/general/summary?${params}`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setGendata(data.data);

       // // console.log(data);
      } else {
      //  // console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server error. Please try again later.");
    }
  };
  useEffect(() => {
    fetchTransactions()
    
    
  }, [backendUrl, token_exp, item]);

  useEffect(() => {
  setFilter((prev) => ({
    ...prev,
    subCategory: item,
  }));
 
}, [item]);

useEffect(() => {
  if (filter.subCategory) {
    fetchGenData();
  }
}, [filter.subCategory, filter.type, filter.fromDate, filter.toDate]);


  return (
    <div className="relative flex flex-col sm:flex-row gap-2 mt-2">
      <button
        className="sm:hidden bg-violet-200 p-1 text-sm rounded-md mb-1"
        onClick={() => setOpen(true)}
      >
        Open Panel
      </button>
      {/* Sidebar / Sidepanel */}
      <div
        className={`
                    absolute top-0 left-0 mt-0 
                    flex flex-col gap-3 w-40 bg-violet-100 p-2 rounded-lg shadow-lg
                    overflow-y-auto max-h-screen
                    transition-transform duration-300 ease-in-out
                    ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0 pointer-events-none"
                    }
                    sm:translate-x-0 sm:opacity-100 sm:pointer-events-auto sm:static sm:max-h-[80vh]
                `}
      >
        {/* Close button for mobile */}
        <button
          className="sm:hidden mb-2 bg-red-200 p-1 rounded"
          onClick={() => setOpen(false)}
        >
          Close
        </button>

        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, index) => (
            <p
              key={index}
              className={`cursor-pointer border rounded-md px-4 py-2 shadow-sm transition duration-200
        ${
          isActive(item)
            ? "bg-purple-600 text-white border-violet-600 shadow-md"
            : "border-violet-500 bg-gray-100 text-violet-800 hover:bg-violet-200"
        }
      `}
              onClick={() => navigate(`/general/${item}`)}
            >
              {item.name || item}
            </p>
          ))
        ) : (
          <p className="text-gray-500 text-center">No subcategories found</p>
        )}
      </div>

      <div className="flex flex-col w-full">
        <div className="text-xs sm:text-base flex flex-col gap-4 mt-0 w-full mx-auto bg-violet-100 rounded-lg shadow-lg p-2 overflow-y-auto max-h-[72vh] min-w-[15rem]">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center">No transactions found.</p>
          ) : (
            transactions.map((txn, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-gray-50 rounded-md shadow-sm p-2 sm:p-4  flex  justify-between items-center hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{txn.subCategory}</p>
                  <p className="text-gray-700 break-words break-all">
                    {txn.description}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(txn.date)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <div
                    className={`font-bold ${
                      txn.type === "spent" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${txn.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => deleteTransaction(txn._id)}
                    className="text-red-500 bg-red-100 rounded-lg border border-gray-100 p-2 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-violet-50 mt-2 rounded-lg py-2 sm:py-3 flex  gap-1 justify-between px-1  shadow-lg border border-violet-200">
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
                <form
                  onSubmit={(e) => {
                    submitFilter(e);
                  }}
                  className="flex flex-col gap-4"
                >
                  <label className="flex flex-col text-gray-700 font-medium">
                    <span>Type</span>
                    <select
                      value={filter.type}
                      onChange={(e) =>
                        setFilter({ ...filter, type: e.target.value })
                      }
                      className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value={"All"}>All</option>
                      <option value={"spent"}>Spent</option>
                      <option value={"received"}>Earned</option>
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
                          subCategory: item,
                          type: "All",
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

          <div className="flex  gap-1 px-1">
            {/* Inflow */}
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg shadow-sm">
              <FiTrendingUp className="text-lg" />
              <div className="flex flex-col text-xs sm:text-sm">
                <span className="font-semibold">Inflow</span>
                <span className="font-bold">₹ {genData.inflow.toFixed(2)}</span>
              </div>
            </div>

            {/* Outflow */}
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg shadow-sm">
              <FiTrendingDown className="text-lg" />
              <div className="flex flex-col text-xs sm:text-sm">
                <span className="font-semibold">Outflow</span>
                <span className="font-bold">
                  ₹ {genData.outflow.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralItem;
