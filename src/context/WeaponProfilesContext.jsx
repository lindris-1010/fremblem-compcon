import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const WeaponProfileContext = createContext();

export function WeaponProfileProvider({ children }) {
  const [weaponProfiles, setWeaponProfiles] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("weapon_profiles");
      setWeaponProfiles(rows);
    })();
  }, []);

  const getWPById = (id) => {
    return weaponProfiles.find((profile) => Number(profile.wp_id) === Number(id));
  };

  return (
    <WeaponProfileContext.Provider value={{ weaponProfiles, getWPById }}>
      {children}
    </WeaponProfileContext.Provider>
  );
}

export function useWeaponProfiles() {
  return useContext(WeaponProfileContext);
}