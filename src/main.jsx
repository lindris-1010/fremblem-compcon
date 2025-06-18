import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'
import { CharacterProvider } from "./context/CharacterContext";
import { ClassProvider } from "./context/ClassContext";
import { FeatProvider } from "./context/FeatContext";
import { PowerProvider } from "./context/PowerContext";
import { EquipmentProvider } from "./context/EquipmentContext";
import { CharEquipProvider } from "./context/CharEquipContext";
import { SkillProvider } from "./context/SkillContext";
import { CreateCharacterProvider } from "./context/CreateCharacterContext";
import { WeaponProfileProvider } from "./context/WeaponProfilesContext";
import { ArmorProfileProvider } from "./context/ArmorProfilesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ArmorProfileProvider>
    <WeaponProfileProvider>
    <CreateCharacterProvider>
    <SkillProvider>
    <CharEquipProvider>
    <EquipmentProvider>
    <PowerProvider>
    <FeatProvider>
    <ClassProvider>
    <CharacterProvider>
      <App />
    </CharacterProvider>
    </ClassProvider>
    </FeatProvider>
    </PowerProvider>
    </EquipmentProvider>
    </CharEquipProvider>
    </SkillProvider>
    </CreateCharacterProvider>
    </WeaponProfileProvider>
    </ArmorProfileProvider>
  </StrictMode>
);
