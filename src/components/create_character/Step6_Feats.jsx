import { useState, useEffect } from "react";
import { useFeats } from "../../context/FeatContext";

export default function Step6_Feats({ characterData, updateCharacterData, setCanContinue }) {
  const [selectedFeatId, setSelectedFeatId] = useState(characterData.selectedFeatId || null);
  const [selectedFeat, setSelectedFeat] = useState(null);

  const { feats } = useFeats();

  useEffect(() => {
    setCanContinue(!!selectedFeatId);
  }, [selectedFeatId, setCanContinue]);

  const handleSelectFeat = (feat) => {
    if (selectedFeatId === feat.feat_id) {
      setSelectedFeatId(null);
      setSelectedFeat(null);
      updateCharacterData("feat_ids", []);
    } else {
      setSelectedFeatId(feat.feat_id);
      setSelectedFeat(feat);
      updateCharacterData("feat_ids", [feat.feat_id]);
    }
  };

  const renderProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-4">
      <span className="text-white font-semibold">Feats: </span>
      <div className={`w-5 h-5 rounded-full ${selectedFeatId ? "bg-green-500" : "bg-gray-400"}`}></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start p-4 bg-gray-800 rounded-xl h-[600px]">
      <h2 className="text-4xl font-semibold mb-4 text-white">Select a Feat:</h2>
      {renderProgress()}

      <div className="flex w-full max-w-4xl gap-6">

        {/* Feat List */}
        <div className="w-1/2 border rounded-lg bg-white p-4 overflow-y-auto text-gray-800 max-h-[400px]">
          <ul className="space-y-2">
            {feats.map((feat) => {
              const isSelected = selectedFeatId === feat.feat_id;

              return (
                <li
                  key={feat.feat_id}
                  className="flex items-start gap-2 cursor-pointer"
                  onClick={() => handleSelectFeat(feat)} // make whole row clickable
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly // prevents React warning since onClick is on the container
                    className="mt-1 pointer-events-none" // don't intercept clicks
                  />
                  <span className={isSelected ? "font-semibold" : ""}>{feat.name}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Feat Details */}
        <div className="w-1/2 border rounded-lg bg-white p-4 overflow-y-auto max-h-[400px]">
          {selectedFeat ? (
            <>
              <h3 className="text-xl text-gray-800 font-bold mb-2">{selectedFeat.name}</h3>
              <p className="text-gray-700">{selectedFeat.description}</p>
            </>
          ) : (
            <p className="text-gray-500">Select a feat to see details</p>
          )}
        </div>
      </div>
    </div>
  );
}