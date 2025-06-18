import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const FeatContext = createContext();

export function FeatProvider({ children }) {
  const [feats, setFeats] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("feats");
      setFeats(rows);
    })();
  }, []);

  const getFeatById = (id) => {
    console.log("All feats: " + feats);
    console.log("searching for feat_id: " + id);
    return feats.find((feat) => Number(feat.feat_id) === Number(id));
  }

  const getFeatsForCharacter = (character) => {
    if (!character.feat_ids) return [];
    try {
          const ids = typeof character.feat_ids === "string"
            ? JSON.parse(character.feat_ids)
            : character.feat_ids;

          return Array.isArray(ids)
            ? ids.map(getFeatById).filter(Boolean)
            : [getFeatById(ids)];
        } catch (e) {
      console.error("Invalid feat_ids JSON:", character.feat_ids);
      return [];
    }
  }

  return (
    <FeatContext.Provider value={{ feats, getFeatById, getFeatsForCharacter }}>
      {children}
    </FeatContext.Provider>
  );
}

export function useFeats() {
  return useContext(FeatContext);
}