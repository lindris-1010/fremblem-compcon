import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initDatabase, loadSampleData } from './db/database';

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ManageChars from "./pages/ManageCharacters";
import ManageNpcs from "./pages/ManageNpcs";
import Compendium from "./pages/Compendium";
import ContentPacks from "./pages/ContentPacks";
import CharacterDetail from "./pages/CharacterDetail";
import CreateCharacter from "./pages/CreateCharacter";

function App() {
  useEffect(() => {
    initDatabase().then(() => {
      console.log('Uploading sample data..')
      loadSampleData();
      console.log('Sample data loaded.');
    });
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto text-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/managecharacters" element={<ManageChars />} />
            <Route path="/managenpcs" element={<ManageNpcs />} />
            <Route path="/compendium" element={<Compendium />} />
            <Route path="/contentpacks" element={<ContentPacks />} />
            <Route path="/character/:id" element={<CharacterDetail />} />
            <Route path="/createcharacter" element={<CreateCharacter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
