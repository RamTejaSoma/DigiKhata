import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const GeneralAdd = () => {
  const [item, setItem] = useState({
    subCategory: "",
    amount: "",
    description: "",
    date: "",
    isNewSubCategory: false,
    type: "spent",
  });
  const { token_exp, backendUrl, items ,fetchSubcategories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const addTransaction = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/general`, item, {
        headers: { token: token_exp },
      });

      if (data.success) {
        toast.success("Transaction added successfully!");
        setItem({
          subCategory: "",
          amount: "",
          description: "",
          date: "",
          isNewSubCategory: false,
          type: "spent",
        });
       // // console.log(data.data);
        await fetchSubcategories();

        navigate("/general");
      } else {
         console.error(data.message);
         toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
   // // console.log("Submitting item:", item);
    addTransaction();
  };
  const handleSubCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "other") {
      setItem((prev) => ({ ...prev, isNewSubCategory: true, subCategory: "" }));
    } else {
      setItem((prev) => ({
        ...prev,
        isNewSubCategory: false,
        subCategory: val,
      }));
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-6 p-6 bg-violet-50 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* SubCategory */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Choose SubCategory</span>
            <select
              required
              value={item.isNewSubCategory ? "other" : item.subCategory}
              onChange={handleSubCategoryChange}
              className="p-2 border rounded"
            >
              <option value="">Select SubCategory</option>
              {items.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
            {item.isNewSubCategory && (
              <input
                required
                type="text"
                placeholder="Enter new subcategory"
                value={item.subCategory}
                onChange={(e) =>
                  setItem((prev) => ({ ...prev, subCategory: e.target.value }))
                }
                className="p-2 border rounded mt-2"
              />
            )}
          </label>

          {/* Type */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Type</span>
            <select
              required
              value={item.type}
              onChange={(e) =>
                setItem((prev) => ({ ...prev, type: e.target.value }))
              }
              className="p-2 border rounded"
            >
              <option value="spent">Spent</option>
              <option value="received">Earned</option>
            </select>
          </label>

          {/* Date */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">
              Select Date of Transaction
            </span>
            <input
              required
              type="date"
              value={item.date}
              onChange={(e) =>
                setItem((prev) => ({ ...prev, date: e.target.value }))
              }
              className="p-2 border rounded"
            />
          </label>

          {/* Amount */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Enter the Amount</span>
            <input
              required
              type="number"
              value={item.amount}
              onChange={(e) => {
                const val = e.target.value;
                setItem((prev) => ({
                  ...prev,
                  amount: val === "" ? "" : Number(val),
                }));
              }}
              className="p-2 border rounded"
            />
          </label>

          {/* Description */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Description</span>
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                setItem((prev) => ({ ...prev, description: e.target.value }))
              }
              className="p-2 border rounded"
              placeholder="Write here..."
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 text-white px-4 py-2 rounded transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
            }`}
          >
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </>
  );
};

export default GeneralAdd;
