import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BusinessAdd = () => {
  const { token_exp, backendUrl, items_bus, fetchBusinessSubcategories } =
    useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const [item, setItem] = useState({
    subCategory: "",
    totalCost: "",
    description: "",
    date: "",
    isNewSubCategory: false,
    type: "buy",
    quantity: "",
    unitPrice: "",
    vendor: "",
  });

  const addTransaction = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/business`, item, {
        headers: { token: token_exp },
      });

      if (data.success) {
        toast.success("Transaction added successfully!");
        setItem({
          subCategory: "",
          totalCost: "",
          description: "",
          date: "",
          isNewSubCategory: false,
          type: "buy",
          quantity: "",
          unitPrice: "",
          vendor: "",
        });
      //  console.log(data.data);
        await fetchBusinessSubcategories();

        navigate("/business");
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
    console.log("Submitting item:", item);
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

  return(
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
              {items_bus.map((sub, index) => (
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
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
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

          {/* Quantity */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Enter Quantity</span>
            <input
              required
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const val = e.target.value;
                setItem((prev) => ({
                  ...prev,
                  quantity: val === "" ? "" : Number(val),
                }));
              }}
              className="p-2 border rounded"
            />
          </label>

          {/* Unit Price */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Enter Unit Price</span>
            <input
              required
              type="number"
              value={item.unitPrice}
              onChange={(e) => {
                const val = e.target.value;
                setItem((prev) => ({
                  ...prev,
                  unitPrice: val === "" ? "" : Number(val),
                }));
              }}
              className="p-2 border rounded"
            />
          </label>

          {/* Total Cost */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Enter the TotalCost</span>
            <input
              //required
              type="number"
              value={item.totalCost}
              onChange={(e) => {
                const val = e.target.value;
                setItem((prev) => ({
                  ...prev,
                  totalCost: val === "" ? "" : Number(val),
                }));
              }}
              className="p-2 border rounded"
            />
          </label>

          {/* Vendor */}
          <label className="flex flex-col">
            <span className="font-semibold mb-1">Vendor Details</span>
            <input
              type="text"
              value={item.vendor}
              onChange={(e) =>
                setItem((prev) => ({ ...prev, vendor: e.target.value }))
              }
              className="p-2 border rounded"
              placeholder="Write here..."
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

export default BusinessAdd;
