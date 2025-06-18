import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Stepper from "../components/Stepper";

import { useCreateCharacter } from "../context/CreateCharacterContext";
import { useCharacters } from "../context/CharacterContext";
import { useCharEquip } from "../context/CharEquipContext";

import Step1 from "../components/create_character/Step1_StatsAndRace";
import Step2 from "../components/create_character/Step2_Class";
import Step3 from "../components/create_character/Step3_Powers";
import Step4 from "../components/create_character/Step4_Skills";
import Step5 from "../components/create_character/Step5_Equipment";
import Step6 from "../components/create_character/Step6_Feats";
import Step7 from "../components/create_character/Step7_Review";

const stepComponents = [
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
];

const steps = [
  "Stats & Race",
  "Class",
  "Powers",
  "Skills",
  "Equipment",
  "Feats",
  "Review",
];

// Step container with smooth height animation
function AnimatedStepContainer({ children, direction, currentStep, dependencies = [] }) {
  const containerRef = useRef(null);
  const [height, setHeight] = useState("auto");

  const measureHeight = () => {
    if (containerRef.current) {
      const contentHeight = containerRef.current.scrollHeight;
      setHeight(contentHeight);
    }
  };

  useEffect(() => {
    measureHeight();
  }, [currentStep]);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      measureHeight();
    }, 30);
    return () => clearTimeout(timeout);
  }, [currentStep, ...dependencies]);

  return (
    <div
      style={{
        height,
        transition: "height 0.3s ease",
        overflow: "hidden",
        position: "relative",
      }}
      className="max-h-[1400px]"
    >
      <div ref={containerRef}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={{
              enter: (dir) => ({
                x: dir > 0 ? 100 : -100,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.3 },
              },
              exit: (dir) => ({
                x: dir > 0 ? -100 : 100,
                opacity: 0,
                transition: { duration: 0.3 },
              }),
            }}
            className="w-full"
            onAnimationComplete={measureHeight}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const CreateCharacter = () => {
  const { characterData, updateCharacterData, resetCharacterData } = useCreateCharacter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const { addCharacterToDB } = useCharacters();
  const { addCharEquipToDB } = useCharEquip();

  // Step 3 bits
  const [canContinueFromStep3, setCanContinueFromStep3] = useState(false);
  const [selectedPowerIds, setSelectedPowerIds] = useState([]);

  const CurrentStepComponent = stepComponents[currentStep];

  // Pull stable ID from characterData (e.g. selected class)
  const classIdDependency = currentStep === 1 ? characterData.class?.id ?? null : null;

  const navigate = useNavigate();

  const nextStep = async () => {
    if (currentStep === 6) {
      try {
        const newCharId = await addCharacterToDB(characterData);
        // add an entry to the char_equipment table for each characterData.equipment entry
        for (const e of characterData.equipment || []) {
          console.log("Inserting equipment:", {
            charId: newCharId,
            profileId: e.p_id,
            profileType: e.profile,
            quantity: e.quantity,
            isEquipped: e.is_equipped,
          });

          await addCharEquipToDB(newCharId, e.p_id, e.profile, e.quantity, e.is_equipped);
        }
        navigate("/managecharacters");
        //navigate(`/character/${newCharId}`);
      } catch (error) {
        console.error("Failed to create character:", error);
        // Optionally show an error toast or message here
      }
    }
    if (currentStep === 2) {
      updateCharacterData("power_ids", selectedPowerIds);
    }
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
      resetCharacterData(); // reset everything when the component mounts
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-700 text-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Your Character</h2>
      <Stepper steps={steps} currentStep={currentStep} />

      <AnimatedStepContainer
        direction={direction}
        currentStep={currentStep}
        dependencies={[classIdDependency]} // Always same length
      >
        <CurrentStepComponent
          characterData={characterData}
          updateCharacterData={updateCharacterData}
          nextStep={nextStep}
          setCanContinue={setCanContinueFromStep3}
          {...(currentStep === 2 && { setSelectedPowerIds })}
        />
      </AnimatedStepContainer>

      <div className="flex justify-between mt-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Back
        </button>
        <div className="text-right">
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && characterData.class == null) ||
                (currentStep === 2 && !canContinueFromStep3) ||
                (currentStep == 6 && characterData.name == null)
                }
              className={`px-4 py-2 rounded ${
                (currentStep === 1 && characterData.class == null) ||
                (currentStep === 2 && !canContinueFromStep3)  ||
                (currentStep == 6 && characterData.name == null)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {currentStep === 6 ? "Finish" : "Next"}
            </button>

            {/* Help text when button is disabled */}
            {currentStep === 1 && characterData.class == null && (
              <p className="text-sm text-red-200 mt-1">
                Please select a Class to continue.
              </p>
            )}
            {currentStep === 2 && !canContinueFromStep3 && (
              <p className="text-sm text-red-200 mt-1">
                Please select 2 At-Will, 2 Encounter, and 1 Daily power to continue.
              </p>
            )}
            {currentStep == 6 && characterData.name == null && (
              <p className="text-sm text-red-200 mt-1">
                Please add a Name before finishing.
              </p>
            )}

        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;