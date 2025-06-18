import { useNavigate } from "react-router-dom";
import { useCharacters } from "../context/CharacterContext";
import { useClasses } from "../context/ClassContext";

export default function ManageCharacters() {
  const navigate = useNavigate();
  const { characters } = useCharacters();
  const { classes } = useClasses();

  function getClassName(classId) {
    const cls = classes.find(c => c.class_id === classId);
    return cls ? cls.name : "Unknown Class";
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Characters</h1>

      {characters.map((char) => (
        <div
          key={char.character_id}
          onClick={() => navigate(`/character/${char.character_id}`)}
          className="flex items-center bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          {/* Placeholder portrait */}
          <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 mr-4" />

          {/* Character info */}
          <div>
            <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">{char.name}</h2>
            </div>
            <p className="text-sm text-gray-600">
              Level {char.level} · {getClassName(char.class_id)}
            </p>
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate("/createcharacter")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
        Add New Character
      </button>
    </div>
  );
}