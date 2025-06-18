import { useParams } from "react-router-dom";
import { useCharacters } from "../context/CharacterContext";
import { useClasses } from "../context/ClassContext";
import { useFeats } from "../context/FeatContext";
import { useEquipment } from "../context/EquipmentContext";
import { useCharEquip } from "../context/CharEquipContext";
import { usePowers } from "../context/PowerContext";
import { useSkills } from "../context/SkillContext";
import { useWeaponProfiles } from "../context/WeaponProfilesContext";
import { useArmorProfiles } from "../context/ArmorProfilesContext";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

export default function CharacterDetail() {
  const { id } = useParams();
  console.log("using id: " + id);

  const { getCharacterById } = useCharacters();
  const character = getCharacterById(Number(id));
  console.log("got character: " + character);

  const { getClassById } = useClasses();
  const char_class = getClassById(Number(character.class_id));

  const { getFeatsForCharacter } = useFeats();
  const feats = getFeatsForCharacter(character);

  // eventually not going to need this one
  //const { getEquipmentForIds } = useEquipment();

  // Get the character's equipment
  const { getWPById } = useWeaponProfiles();
  const { getAPById } = useArmorProfiles();
  const { getCharEquipForCharacter } = useCharEquip();

  const charEquipArray = getCharEquipForCharacter(character);
  const equipmentArray = charEquipArray.map((row) => {
    let profileData = null;

    if (row.profile_type === "weapon") {
      profileData = getWPById(row.profile_id);
    } else if (row.profile_type === "armor") {
      profileData = getAPById(row.profile_id);
    }

    return {
      ...row,
      ...profileData,
    };
  });

  const { getPowersForCharacter } = usePowers();

  const { getSkillsForCharacter } = useSkills();
  const skills = getSkillsForCharacter(character);

  const calculateMod = (a) => Math.floor((a - 10) / 2);

  const abilities = [
    ["Str", character.str_score, calculateMod(character.str_score)],
    ["Con", character.con_score, calculateMod(character.con_score)],
    ["Dex", character.dex_score, calculateMod(character.dex_score)],
    ["Int", character.int_score, calculateMod(character.int_score)],
    ["Wis", character.wis_score, calculateMod(character.wis_score)],
    ["Cha", character.cha_score, calculateMod(character.cha_score)]
  ];

  const class_def_mods = char_class.def_boosts;
  console.log("Class adds def boosts: " + class_def_mods);

  const getGreaterMod = (a, b) => calculateMod(a) >= calculateMod(b)
    ? calculateMod(a) : calculateMod(b);

  const armorACBonus = equipmentArray.find((row) =>
    row.profile_type === "armor" && row.is_equipped === 1)?.ac_bonus ?? 0;

  const isArmorHeavy = equipmentArray.find((row) =>
    row.profile_type === "armor" && row.is_equipped === 1)?.type?.includes("heavy_armor") ?? false;

  const charArmorAbility = isArmorHeavy
    ? armorACBonus
    : armorACBonus + getGreaterMod(character.dex_score, character.int_score);

  console.log("equipped armor bonus: " + armorACBonus);

// AC Section
  const def_ac_calc = [
    10 + Math.floor(character.level / 2), // 10 + 1/2 lv
    charArmorAbility, // armor/ability
    0, // until classes get def boosts, this is 0
    0, // Feat bonus
    0, // Enhance bonus from armor, get equipped items, check to see if any are armor, then check mods
    0, // misc 1
    0 // misc 2
    ];

  const def_ac_num = def_ac_calc.reduce((sum, num) => sum + num, 0);
  const def_ac = [def_ac_num, "AC", ...def_ac_calc];

// FORT
  const def_fort_calc = [
    10 + Math.floor(character.level / 2), // 10 + 1/2 lv
    getGreaterMod(character.str_score, character.con_score), // armor/ability
    class_def_mods[0], // until classes get def boosts, this is 0
    0, // Feat bonus
    0, // Enhance bonus from armor, get equipped items, check to see if any are armor, then check mods
    0, // misc 1
    0 // misc 2
    ];

  const def_fort_num = def_fort_calc.reduce((sum, num) => sum + num, 0);
  const def_fort = [def_fort_num, "FORT", ...def_fort_calc];

// REF
  const def_ref_calc = [
    10 + Math.floor(character.level / 2), // 10 + 1/2 lv
    getGreaterMod(character.dex_score, character.int_score), // armor/ability
    class_def_mods[1], // until classes get def boosts, this is 0
    0, // Feat bonus
    0, // Enhance bonus from armor, get equipped items, check to see if any are armor, then check mods
    0, // misc 1
    0 // misc 2
    ];

  const def_ref_num = def_ref_calc.reduce((sum, num) => sum + num, 0);
  const def_ref = [def_ref_num, "REF", ...def_ref_calc];

// WILL
  const def_will_calc = [
    10 + Math.floor(character.level / 2), // 10 + 1/2 lv
    getGreaterMod(character.wis_score, character.cha_score), // armor/ability
    class_def_mods[2], // until classes get def boosts, this is 0
    0, // Feat bonus
    0, // Enhance bonus from armor, get equipped items, check to see if any are armor, then check mods
    0, // misc 1
    0 // misc 2
    ];

  const def_will_num = def_will_calc.reduce((sum, num) => sum + num, 0);
  const def_will = [def_will_num, "WILL", ...def_will_calc];

  const defenses = [
    def_ac,
    def_fort,
    def_ref,
    def_will
  ];

  const max_hp = (char_class.starting_hp + character.con_score) + (char_class.hp_per_level * (character.level - 1));

  const stats = [
    [max_hp, "Max HP"],
    [Math.floor(max_hp / 2), "Bloodied"],
    [Math.floor(Math.floor(max_hp / 2) / 2), "Surge Value"],
    [char_class.healing_surges + Math.floor((character.con_score - 10) / 2), "Surges/Day"],
  ];


  //console.log(feats);

  // Coinage
  // TODO: FIGURE THIS OUT
  const coins = [character.cp, character.sp, character.gp]; // Copper, Silver, Gold
  const coinLabels = ["CP", "SP", "GP"];
  const coinColors = ["bg-amber-800", "bg-gray-400", "bg-yellow-500"];

  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const sections = ["Learned Powers", "Feats and Equipment", "Skills"];
  const [sectionIndex, setSectionIndex] = useState(1); // default to "Feats and Equipment"

  const currentSection = sections[sectionIndex];
  const prevIndex = (sectionIndex - 1 + sections.length) % sections.length;
  const nextIndex = (sectionIndex + 1) % sections.length;

  const [direction, setDirection] = useState(0);

  const goLeft = () => {
    setDirection(-1);
    setSectionIndex((prev) => (prev - 1 + sections.length) % sections.length);
  };

  const goRight = () => {
    setDirection(1);
    setSectionIndex((prev) => (prev + 1) % sections.length);
  };

  const groupPowersByUseType = (powersArray) => {
    return powersArray.reduce((grouped, power) => {
      // Normalize use_type
      const type = power.use_type
        .split('_')
        .map(w => w[0].toUpperCase() + w.slice(1))
        .join('-');

      if (!grouped[type]) {
        grouped[type] = [];
      }

      // Assemble the power contents
      grouped[type].push({
        name: power.name,
        description: power.description,
        action_type: power.action_type,
        keywords: power.keywords,
        weapon: power.weapon,
        target: power.target,
        attack: power.attack,
        range: power.range,
        effect: power.effect,
        level: power.level,
        use_type: power.use_type
      });

      return grouped;
    }, {});
  };

  const formatKeyword = (str) => {
    if (!str) return "";
    return str
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const char_powers = groupPowersByUseType(getPowersForCharacter(character));

  // For determining the active power to display
  const [selectedPower, setSelectedPower] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  // Detail snippets

  const WeaponDetail = ({ item }) => {
    return (
      <div className="space-y-4 text-gray-800 text-sm">
        {/* Top section: Weapon name and type */}
        <div className="p-4 space-y-2 text-gray-800 text-sm">
          {/* Weapon & Keywords */}
           <div className="flex flex-wrap gap-2 text-gray-600">
              <span><strong>Weapon</strong></span>
              <span> • </span>
              <span><strong>{item.type?.map(formatKeyword).join(", ")}</strong></span>
           </div>

           {/* Action Type & Range or Weapon */}
           <div className="flex flex-wrap gap-2 text-gray-600">
              <span> <strong>Prof. Bonus:</strong> +{item.prof_bonus}</span>
              <span> • </span>
              <span><strong>Range:</strong> {item.range} {item.range === 1 ? "Space" : "Spaces"}</span>
           </div>
           <div className="space-y-2 text-left">
              <div className="text-gray-700">
                 <strong>Damage:</strong> {item.damage}
              </div>

              {/* Description */}
              {item.description && (
                 <div className="bg-gray-100 border-l-4 border-gray-400 p-2 text-gray-700">
                    {item.description}
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const ArmorDetail = ({ item }) => {
      return (
        <div className="space-y-4 text-gray-800 text-sm">
          {/* Top section: Weapon name and type */}
          <div className="p-4 space-y-2 text-gray-800 text-sm">
            {/* Weapon & Keywords */}
             <div className="flex flex-wrap gap-2 text-gray-600">
                <span><strong>Armor</strong></span>
                <span> • </span>
                <span><strong>{item.type?.map(formatKeyword).join(", ")}</strong></span>
             </div>

             {/* Action Type & Range or Weapon */}
             <div className="flex flex-wrap gap-2 text-gray-600">
                <span> <strong>AC Bonus:</strong> +{item.ac_bonus}</span>
                <span> • </span>
                <span><strong>Min. Enhancement Bonus:</strong> {item.min_enhance_bonus}</span>
             </div>
             <div className="space-y-2 text-left">
                {/* Description */}
                {item.description && (
                   <div className="bg-gray-100 border-l-4 border-gray-400 p-2 text-gray-700">
                      {item.description}
                   </div>
                )}
             </div>
          </div>
        </div>
      );
    };

  // end Detail snippets

  if (!character) {
    return <div className="p-6 text-red-600">Character not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Character Banner */}
      <div className="bg-gray-800 text-white rounded-lg p-4">
        <h1 className="text-3xl font-bold">{character.name}</h1>
        <p className="text-sm text-gray-300">
          Level {character.level} {char_class.name}
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Stats</h2>

      {/* Main Grid */}
      <div className="flex justify-evenly gap-4 mt-6 flex-wrap items-stretch">

        {/* Abilities Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-[230px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Ability Scores
          </h3>
          <table className="w-full text-sm text-gray-700">
            <tbody>
              {abilities.map(([stat, score, mod]) => (
                <tr key={stat} className="border-b last:border-b-0">
                  <td className="py-2 text-base font-bold">{stat}</td>
                  <td className="py-2 text-center">{score}</td>
                  <td className={`px-4 py-2 font-semibold text-center ${
                      score > 9 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {score > 9 ? `+${mod}` : `${mod}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Defense Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-3 max-w-[480px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Defenses
          </h3>
          <div className="flex flex-col justify-between flex-1">
          {defenses.map(([circle, label, ...boxes]) => (
            <div key={label} className="flex items-center gap-2 mb-10">
              <div className="w-12 shrink-0 text-right pr-2">
                <p className="text-gray-800 font-bold text-base mt-1">{label}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                {circle}
              </div>
              <div className="grid grid-cols-8 gap-1 flex-1">
                {boxes.map((num, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 rounded text-center text-base text-gray-800 p-1"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Vital Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-[230px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Hit Points
          </h3>
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="border rounded p-2 text-center shadow-sm mb-2"
            >
              <p className="text-lg font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-300" />

      {/* Second Section */}
      <div className="relative h-12 mb-6 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={sectionIndex} // triggers animation on index change
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
            className="inset-0 flex items-center justify-between w-full"
          >
            <button
              onClick={goLeft}
              className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded transition"
            >
              ← {sections[(sectionIndex - 1 + sections.length) % sections.length]}
            </button>

            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-800">
              {sections[sectionIndex]}
            </h2>

            <button
              onClick={goRight}
              className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded transition"
            >
              {sections[(sectionIndex + 1) % sections.length]} →
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={sectionIndex} // required for animation to trigger
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
                transition: { duration: 0.1 },
              },
              exit: (dir) => ({
                x: dir > 0 ? -100 : 100,
                opacity: 0,
                transition: { duration: 0.1 },
              }),
            }}
            className="w-full"
          >


      {currentSection === "Feats and Equipment" && (
        <div className="flex justify-evenly gap-4 mt-6 flex-wrap items-stretch">

                {/* Feats Card */}
                <div className="bg-white rounded-2xl shadow-xl p-4 w-[260px]">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Feats</h3>
                  <ul className="space-y-2 max-h-[336px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                    {feats.map((feat) => (
                      <li
                        key={feat.name}
                        className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
                        onClick={() => openModal(feat)}
                      >
                        {feat.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Equipment Card */}
                <div className="bg-white rounded-2xl shadow-xl p-4 w-[260px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Equipment</h3>
                    <ul className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 mb-4">
                      {equipmentArray.map((item) => (
                        <li
                          key={item.name}
                          className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
                          onClick={() => openModal(item)}
                        >
                          {item.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-center font-semibold text-gray-700 mb-2">Coins</h4>
                    <div className="flex justify-between gap-2">
                      {coins.map((value, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${coinColors[idx]}`}
                          >
                            {value}
                          </div>
                          <span className="mt-1 text-xs font-medium text-gray-700">{coinLabels[idx]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
        </div>
      )}

      {currentSection === "Learned Powers" && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Powers</h3>

          <div className="flex gap-6">
            {/* Left: Dropdowns */}
            <div className="w-1/2 space-y-4">
              {Object.entries(char_powers).map(([type, list]) => (
                <details key={type} className="border rounded-lg">
                  <summary className="text-gray-800 cursor-pointer select-none px-4 py-2 bg-gray-100 font-semibold">
                    {type} Powers
                  </summary>
                  <ul className="text-gray-800 px-4 py-2 space-y-2">
                    {list.map((char_power) => (
                      <li
                        key={char_power.name}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => setSelectedPower(char_power)}
                      >
                        {char_power.name}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            {/* Right: Power Details */}
            <div className="w-1/2 border rounded-lg bg-white overflow-hidden shadow">
              {selectedPower ? (
                <>
                  {/* Header with color-coded bar */}
                  <div
                    className="flex justify-between items-center px-4 py-2 text-white"
                    style={{
                      backgroundColor:
                        selectedPower.use_type === "at_will"
                          ? "#3a8050" // green
                          : selectedPower.use_type === "encounter"
                          ? "#760021" // red
                          : "#303332", // gray
                    }}
                  >
                    <h4 className="text-xl font-bold">{selectedPower.name}</h4>
                    <span className="text-sm">Level {selectedPower.level}</span>
                  </div>

                  <div className="p-4 space-y-2 text-gray-800 text-sm">
                    {/* Use Type & Keywords */}
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      <span className="capitalize">{selectedPower.use_type?.replace("_", " ") || "Unknown"}</span>
                      <span>•</span>
                      <span>{selectedPower.keywords.replace(/[\[\]]/g, "")}</span>
                    </div>

                    {/* Action Type & Range or Weapon */}
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      <span>
                        <strong>Action:</strong> {selectedPower.action_type}
                      </span>
                      {selectedPower.range || selectedPower.weapon ? (
                        <>
                          <span>•</span>
                          <span>
                            {selectedPower.range ? (
                              <>
                                <strong>Range:</strong> {selectedPower.range}
                              </>
                            ) : (
                              <>
                                <strong>Weapon:</strong> {selectedPower.weapon}
                              </>
                            )}
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div className="space-y-2 text-left">
                      {/* Target */}
                      {selectedPower.target && (
                        <div className="text-gray-700">
                          <strong>Target:</strong> {selectedPower.target}
                        </div>
                      )}

                      {/* Attack */}
                      {selectedPower.attack && (
                        <div className="text-gray-700">
                          <strong>Attack:</strong> {selectedPower.attack}
                        </div>
                      )}
                    </div>

                    {/* Effect */}
                    {selectedPower.effect && (
                      <div className="bg-gray-100 border-l-4 border-gray-400 p-2 text-gray-700">
                        <strong>Effect:</strong> {selectedPower.effect}
                      </div>
                    )}

                    {/* Description */}
                    <div className="italic text-gray-600">{selectedPower.description}</div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-gray-500 italic">Select a power to view its details.</div>
              )}
            </div>
          </div>
        </div>
      )}


      {currentSection === "Skills" && (
        <div className="flex justify-evenly gap-4 flex-wrap">
          {/* Skills Column */}
          <div className="bg-white rounded-2xl shadow-xl p-4 w-[230px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Skills</h3>
            <ul className="space-y-2">
                {skills.map((skill) => {
                  const abilityScore = character?.[`${skill.ability_used}_score`] || 0;
                  const bonus = calculateMod(abilityScore) + 5 + Math.floor(character.level / 2);
                  const formattedBonus = bonus >= 0 ? `+${bonus}` : `${bonus}`;

                  return (
                    <li key={skill.name} className="text-gray-800 bg-blue-100 p-2 rounded">
                      {skill.name} {formattedBonus}
                    </li>
                  );
                })}
              </ul>
          </div>

          {/* FE Skills Column */}
          <div className="bg-white rounded-2xl shadow-xl p-4 w-[230px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">FE Skills</h3>
            <p className="text-gray-500 text-center">Not available until level 5</p>
          </div>
        </div>
      )}

          </motion.div>
        </AnimatePresence>
      </div>


      {/* Modal */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={() => setIsOpen(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Background overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-60"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-60" aria-hidden="true" />
            </Transition.Child>

            {/* Slide-in panel */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-x-full opacity-0"
              enterTo="translate-x-0 opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0 opacity-100"
              leaveTo="translate-x-full opacity-0"
            >
              <div className="bg-white rounded-lg shadow-xl p-6 z-20 max-w-md w-full transform transition-all">
                {selectedItem && (
                  <Dialog.Panel>
                    <div className="border rounded-lg bg-white overflow-hidden shadow">
                      <Dialog.Title>
                        <div className="flex justify-between items-center px-4 py-2 text-white"
                          style={{ backgroundColor: "#c87b17" }}>
                          <h4 className="text-xl font-bold">{selectedItem.name}</h4>
                          {selectedItem?.is_equipped !== undefined && (
                            <p>{selectedItem.is_equipped ? "Equipped" : "Not Equipped"}</p>
                          )}
                        </div>
                      </Dialog.Title>

                      {selectedItem.profile_type === 'weapon' && (
                        <WeaponDetail item={selectedItem} />
                      )}

                      {selectedItem.profile_type === 'armor' && (
                        <ArmorDetail item={selectedItem} />
                      )}

                      {selectedItem.profile_type === 'other' && (
                        <GenericItemDetail item={selectedItem} />
                      )}

                      {selectedItem.profile_type === undefined && (
                        <p>{selectedItem.description}</p>
                      )}
                    </div>
                  </Dialog.Panel>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Bottom Spacer */}
      <div className="p-6 space-y-6 pb-16"></div>
    </div>
  );
}
