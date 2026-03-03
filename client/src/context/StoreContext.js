import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get("/api/categories/"),
          API.get("/api/products/"),
        ]);

        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.log("Store load error:", err);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <StoreContext.Provider
      value={{ categories, products, loading }}
    >
      {children}
    </StoreContext.Provider>
  );
}
