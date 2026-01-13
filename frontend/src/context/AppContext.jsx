import { useEffect } from "react";
import { createContext, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [token_exp, setToken] = useState(
    localStorage.getItem("token_exp")
      ? localStorage.getItem("token_exp")
      : false
  );
  const backendUrl = "https://digikhata-backend.onrender.com";

  const [items, setItems] = useState([]);
  const [items_bus, setItems_bus] = useState([]);
  const [items_money, setItems_money] = useState([]);

  const fetchBusinessSubcategories = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/business/subcategory`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setItems_bus(data.data);
      } else {
        // // console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/general/subcategory`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setItems(data.data);
      } else {
        //// console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchMoneyTxnSubcategories = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/moneyTransaction/subcategory`,
        {
          headers: { token: token_exp },
        }
      );
      if (data.success) {
        setItems_money(data.data);
        // // console.log(data.data);
      } else {
       // // console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if (token_exp) {
      fetchSubcategories();
      fetchBusinessSubcategories();
      fetchMoneyTxnSubcategories();
    }
  }, [token_exp]);

  const value = {
    token_exp,
    setToken,
    backendUrl,
    fetchSubcategories,
    items,
    setItems,
    items_bus,
    setItems_bus,
    fetchBusinessSubcategories,
    items_money,
    setItems_money,
    fetchMoneyTxnSubcategories,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
export default AppContextProvider;
