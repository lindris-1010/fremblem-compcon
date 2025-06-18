import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="text-gray-800 space-y-4 p-6">
      <h1 className="text-2xl font-bold">The Fremblem 4E Webapp Tool!</h1>
      <p>
        This is my unofficial tool inspired by COMP/CON, built to support a Fire Emblem-ish tabletop system built on top of Dnd 4E.
      </p>
      <p>
        Currently, this app is designed for the creation/management of player characters. I'd like to add more features in the future if I have the spare time to do so.
      </p>
      <p>
        To get started, either use the sidebar on the left, or press the button below to start making your first character!
      </p>
      <button
        onClick={() => navigate("/createcharacter")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
      >
        Create Character
      </button>
    </div>
  );
}