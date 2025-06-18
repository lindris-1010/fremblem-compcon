import React, { createContext, useContext, useState } from "react";

// Create context
const CreateCharacterContext = createContext();

// Provider component
export function CreateCharacterProvider({ children }) {
  const defaultData = {
                          // Initialize with default character data shape
                          abilityScores: {
                            str: 10,
                            dex: 10,
                            con: 10,
                            int: 10,
                            wis: 10,
                            cha: 10,
                          },
                          coins: {
                            gp: 100,
                            sp: 0,
                            cp: 0,
                          },
                          equipment: [],
                          race: null,
                          class: null,
                          power_ids: [],
                          skill_ids: [],
                          equipment: [],
                          feat_ids: [],
                          name: null,
                          // Add other fields as needed
                        }

  const [characterData, setCharacterData] = useState(defaultData);

  // To clean up the create character flow
  const resetCharacterData = () => setCharacterData(defaultData);

  // A helper function to update nested character data safely
  const updateCharacterData = (field, value) => {
    setCharacterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <CreateCharacterContext.Provider value={{ characterData, updateCharacterData, resetCharacterData }}>
      {children}
    </CreateCharacterContext.Provider>
  );
}

// Custom hook for easy usage
export function useCreateCharacter() {
  return useContext(CreateCharacterContext);
}