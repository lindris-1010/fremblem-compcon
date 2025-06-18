import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const ClassContext = createContext();

export function ClassProvider({ children }) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("classes");
      setClasses(rows);
    })();
  }, []);

  const getClassById = (id) =>
    classes.find((class_obj) => class_obj.class_id === id);

  return (
    <ClassContext.Provider value={{ classes, getClassById }}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  return useContext(ClassContext);
}