import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const General = () => {
  const { token_exp, backendUrl, items, fetchSubcategories } =
    useContext(AppContext);

  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
   const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState({
    subCategory: "All",
    type: "All",
    fromDate: "",
    toDate: "",
  });
  const [showFilter_report, setShowFilter_report] = useState(false);
  const [filter_report, setFilter_report] = useState({
    subCategory: "All",
    type: "All",
    fromDate: "",
    toDate: "",
  });
  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/general/all`, {
        headers: { token: token_exp },
      });
      if (data.success) {
        setTransactions(data.data);
        //// console.log(transactions);
       // // console.log(data);
      } else {
        //// console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server error. Please try again later.");
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [backendUrl, token_exp]);
  
  useEffect(() => {
   // // console.log("Transactions updated:", transactions);
  }, [transactions]);

  // Format date like "12 Mar 2025"
  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
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
       // // console.log(data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Server error. Please try again later.");
    }
  };

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
        toast.success("Filter Applied Succesfully");
      } else {
        //// console.log("Error:", data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      toast.error("Server error. Please try again later.");
    }

    setFilter({
      subCategory: "All",
      type: "All",
      fromDate: "",
      toDate: "",
    });

    setShowFilter(false);
  };

  const submitFilter_report = async (e) => {
    e.preventDefault();
   // // console.log("Filter applied:", filter_report);

    const filtersToSend = {};
    if (filter_report.subCategory) {
      filtersToSend.subCategory = filter_report.subCategory;
    }
    if (filter_report.type) {
      filtersToSend.type = filter_report.type;
    }
    if (filter_report.fromDate) {
      filtersToSend.fromDate = filter_report.fromDate;
    }
    if (filter_report.toDate) {
      filtersToSend.toDate = filter_report.toDate;
    }

    //// console.log("Applying filters:", filtersToSend);

    setLoadingPdf(true);

    try {
      const params = new URLSearchParams(filtersToSend).toString();

      // Tell axios we're expecting a binary PDF file
      const response = await axios.get(
        `${backendUrl}/api/general/reportPdf?${params}`,
        {
          headers: { token: token_exp },
          responseType: "blob", // important!
        }
      );

      // Create a blob and a temporary download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "general_expenses_report.pdf"; //downloading
      document.body.appendChild(a);
      a.click();

      // Clean up
      a.remove();
      window.open(url, "_blank"); //for opening in new tab

      window.URL.revokeObjectURL(url);

      toast.success("PDF prepared Successfully!");
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoadingPdf(false);
    }

    setFilter_report({
      subCategory: "All",
      type: "All",
      fromDate: "",
      toDate: "",
    });

    setShowFilter_report(false);
  };

  return (
    <>
      <div className="flex   text-xs sm:text-base justify-center gap-4 bg-gradient-to-r from-violet-100 via-violet-50 to-violet-100 p-1 sm:p-2 rounded-xl shadow-md mt-1 sm:mt-1   ">
        <button
          onClick={() => setShowFilter(true)}
          className="bg-purple-600 text-white font-semibold px-2 py-1 rounded-lg shadow-md hover:bg-purple-700 transition-all duration-200"
        >
          Filter
        </button>

        <button
          onClick={() => navigate("/general/add")}
          className="bg-indigo-500 text-white font-semibold px-2 py-1 rounded-lg shadow-md hover:bg-indigo-600 transition-all duration-200"
        >
          Add Transaction
        </button>

        <button
          onClick={() => setShowFilter_report(true)}
          className="bg-pink-500 text-white font-semibold px-2 py-1 rounded-lg shadow-md hover:bg-pink-600 transition-all duration-200"
        >
          Generate PDF
        </button>
      </div>

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
                  {items.map((item, index) => {
                    return (
                      <option value={item} key={index}>
                        {item}
                      </option>
                    );
                  })}
                </select>
              </label>
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
                      subCategory: "All",
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
      {showFilter_report && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Filter For Report
            </h2>
            <form
              onSubmit={submitFilter_report}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col text-gray-700 font-medium">
                <span>subCategory</span>

                <select
                  value={filter_report.subCategory}
                  onChange={(e) =>
                    setFilter_report({
                      ...filter_report,
                      subCategory: e.target.value,
                    })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value={"All"}>All</option>
                  {items.map((item, index) => {
                    return (
                      <option value={item} key={index}>
                        {item}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="flex flex-col text-gray-700 font-medium">
                <span>Type</span>
                <select
                  value={filter_report.type}
                  onChange={(e) =>
                    setFilter_report({ ...filter_report, type: e.target.value })
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
                  value={filter_report.fromDate}
                  onChange={(e) =>
                    setFilter_report({
                      ...filter_report,
                      fromDate: e.target.value,
                    })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                  type="Date"
                />
              </label>
              <label className="flex flex-col text-gray-700 font-medium flex-1">
                <span>toDate</span>
                <input
                  value={filter_report.toDate}
                  onChange={(e) =>
                    setFilter_report({
                      ...filter_report,
                      toDate: e.target.value,
                    })
                  }
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                  type="Date"
                />
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFilter_report({
                      subCategory: "All",
                      type: "All",
                      fromDate: "",
                      toDate: "",
                    });
                    setShowFilter_report(false);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingPdf}
                  className={`px-4 py-2 rounded text-white ${
                    loadingPdf
                      ? "bg-violet-300"
                      : "bg-violet-500 hover:bg-violet-600"
                  }`}
                >
                  {loadingPdf ? "Generating..." : "Generate PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="relative flex flex-col sm:flex-row gap-3 mt-2">
         <button
          className="sm:hidden bg-violet-200 p-1 text-sm rounded-md "
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
                className="cursor-pointer border border-violet-500 bg-gray-100 text-violet-800 rounded-md px-4 py-2 shadow-sm hover:shadow-md hover:bg-violet-200 transition duration-200"
                onClick={() => navigate(`/general/${item}`)}
              >
                {item.name || item}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-center">No subcategories found</p>
          )}
        </div>
        
        <div className="text-xs sm:text-base flex flex-col gap-4 mt-1 w-full mx-auto bg-violet-100 rounded-lg shadow-lg p-2 overflow-y-auto max-h-[80vh] min-w-[15rem]">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center">No transactions found.</p>
          ) : (
            transactions.map((txn, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-gray-50 rounded-md shadow-sm p-4 flex justify-between items-center hover:shadow-md transition-shadow duration-200"
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
        
        
      </div>
    </>
  );
};

export default General;
