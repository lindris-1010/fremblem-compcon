import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const ArmorProfileContext = createContext();

export function ArmorProfileProvider({ children }) {
  const [armorProfiles, setArmorProfiles] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("armor_profiles");
      setArmorProfiles(rows);
    })();
  }, []);

  const getAPById = (id) => {
    return armorProfiles.find((profile) => Number(profile.ap_id) === Number(id));
  };

  return (
    <ArmorProfileContext.Provider value={{ armorProfiles, getAPById }}>
      {children}
    </ArmorProfileContext.Provider>
  );
}

export function useArmorProfiles() {
  return useContext(ArmorProfileContext);
}