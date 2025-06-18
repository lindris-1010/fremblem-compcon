import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useArmorProfiles } from "../../context/ArmorProfilesContext";
import { useWeaponProfiles } from "../../context/WeaponProfilesContext";

const formatKeyword = (kw) => kw.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const WeaponDetail = ({ item }) => (
  <div className="space-y-4 text-gray-800 text-sm">
    <div className="p-4 space-y-2">
      <div className="flex flex-wrap gap-2 text-gray-600">
        <span><strong>Weapon</strong></span>
        <span> • </span>
        <span><strong>{item.type?.map(formatKeyword).join(", ")}</strong></span>
      </div>
      <div className="flex flex-wrap gap-2 text-gray-600">
        <span><strong>Prof. Bonus:</strong> +{item.prof_bonus}</span>
        <span> • </span>
        <span><strong>Range:</strong> {item.range} {item.range === 1 ? "Space" : "Spaces"}</span>
      </div>
      <div className="space-y-2">
        <div><strong>Damage:</strong> {item.damage}</div>
        {item.description && (
          <div className="bg-gray-100 border-l-4 border-gray-400 p-2">{item.description}</div>
        )}
      </div>
    </div>
  </div>
);

const ArmorDetail = ({ item }) => (
  <div className="space-y-4 text-gray-800 text-sm">
    <div className="p-4 space-y-2">
      <div className="flex flex-wrap gap-2 text-gray-600">
        <span><strong>Armor</strong></span>
        <span> • </span>
        <span><strong>{item.type?.map(formatKeyword).join(", ")}</strong></span>
      </div>
      <div className="flex flex-wrap gap-2 text-gray-600">
        <span><strong>AC Bonus:</strong> +{item.ac_bonus}</span>
        <span> • </span>
        <span><strong>Min. Enhancement Bonus:</strong> {item.min_enhance_bonus}</span>
      </div>
      {item.description && (
        <div className="bg-gray-100 border-l-4 border-gray-400 p-2">{item.description}</div>
      )}
    </div>
  </div>
);

export default function Step5_Equipment({ characterData, updateCharacterData }) {
  const { armorProfiles } = useArmorProfiles();
  const { weaponProfiles } = useWeaponProfiles();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null); // "weapon" or "armor"

  const [selectedOwnedItem, setSelectedOwnedItem] = useState(null);
  const [selectedOwnedType, setSelectedOwnedType] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);

  const [selectedOwnedCount, setSelectedOwnedCount] = useState(1);

  const openModal = (item, type) => {
    setModalItem(item);
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const canAfford = (cost) => {
    const { gp = 0, sp = 0, cp = 0 } = characterData.coins || {};
    const totalCoins = gp * 100 + sp * 10 + cp;
    return totalCoins >= Math.round(cost * 100);
  };

  const coinLabels = ["CP", "SP", "GP"];
  const coinColors = ["bg-amber-800", "bg-gray-400", "bg-yellow-500"];
  const coinValues = [
    characterData.coins?.cp || 0,
    characterData.coins?.sp || 0,
    characterData.coins?.gp || 0,
  ];

  const addEquipment = (item, type) => {
      const isEquipped = type === "armor" ? 1 : 0; // Since this applies for calculations, for the demo use this
      const itemId = type === "weapon" ? item.wp_id : item.ap_id;
      const equipmentList = [...(characterData.equipment || [])];
      console.log("Adding item:", { type, itemId });
      console.log("Current equipmentList:", equipmentList);
      const index = equipmentList.findIndex(
        (eq) => eq.profile === type && eq.p_id === itemId
      );

      if (index !== -1) {
        equipmentList[index].quantity += 1;
      } else {
        equipmentList.push({ profile: type, p_id: itemId, quantity: 1, is_equipped: isEquipped });
      }

      updateCharacterData("equipment", equipmentList);
      closeModal();
    };

  const handleSell = (countToSell) => {
    const itemId = selectedOwnedType === "weapon" ? selectedOwnedItem?.wp_id : selectedOwnedItem?.ap_id;

    const updatedEquip = (characterData.equipment || []).reduce((acc, eq) => {
          if (eq.profile === selectedOwnedType && eq.p_id === itemId) {
            const remainingQty = eq.quantity - countToSell;
            if (remainingQty > 0) {
              acc.push({ ...eq, quantity: remainingQty });
            }
          } else {
            acc.push(eq);
          }
          return acc;
    }, []);

    const refund = Math.floor((selectedOwnedItem?.cost || 0) * 100) * countToSell;
    const totalCP = (characterData.coins?.cp || 0) +
                    (characterData.coins?.sp || 0) * 10 +
                    (characterData.coins?.gp || 0) * 100 +
                    refund;

    const newCoins = {
      gp: Math.floor(totalCP / 100),
      sp: Math.floor((totalCP % 100) / 10),
      cp: totalCP % 10,
    };

    updateCharacterData("equipment", updatedEquip);
    updateCharacterData("coins", newCoins);
    setSellModalOpen(false);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl h-[700px]">
      <h2 className="text-4xl font-semibold mb-4">Select Equipment:</h2>
    <div className="flex gap-4 p-4 h-[600px]">

      {/* Left: Equipment List */}
      <div className="text-gray-800 w-1/3 border p-2 space-y-2 bg-gray-100 rounded-xl">
        <h2 className="font-bold">Current Equipment</h2>

        {/* Styled Coin Display */}
        <div className="flex justify-around gap-2 py-2">
          {coinValues.map((value, idx) => (
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

        {/* Grouped equipment display */}
        {(characterData.equipment || []).map((eq) => {
                    const source = eq.profile === "weapon" ? weaponProfiles : armorProfiles;
                    const item = source.find((p) =>
                      eq.profile === "weapon" ? p.wp_id === eq.p_id : p.ap_id === eq.p_id
                    );

                    return (
                      <div
                        key={`${eq.profile}-${eq.p_id}`}
                        onClick={() => {
                          setSelectedOwnedItem(item);
                          setSelectedOwnedType(eq.profile);
                          setSelectedOwnedCount(eq.quantity);
                          setSellModalOpen(true);
                        }}
                        className="cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {item?.name || "Unknown Item"}
                        {eq.quantity > 1 && <span className="ml-2 text-sm text-gray-500">x {eq.quantity}</span>}
                      </div>
                    );
                  })}
      </div>

      {/* Right: Selectors */}
      <div className="w-2/3 space-y-4">

        <div className="space-y-4 bg-gray-100 rounded-xl">
          <details className="border rounded-lg">
            <summary className="text-gray-800 cursor-pointer select-none px-4 py-2 bg-gray-300 font-semibold">
              Equipment
            </summary>
            <ul className="text-gray-800 px-4 py-2 space-y-2">
              {weaponProfiles.map((weapon) => (
                <li
                  key={`weapon-${weapon.wp_id}`}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => openModal(weapon, "weapon")}
                >
                  <span>{weapon.name} -- {weapon.cost} gp</span>
                </li>
              ))}
              {armorProfiles.map((armor) => (
                <li
                  key={`armor-${armor.ap_id}`}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => openModal(armor, "armor")}
                >
                  <span>{armor.name} -- {armor.cost} gp</span>
                </li>
              ))}
            </ul>
          </details>
        </div>

      </div>

      {/* Modal */}
      <Transition appear show={modalOpen} as={React.Fragment}>
        <Dialog onClose={closeModal} className="relative z-10">
          <Transition.Child
            enter="ease-out duration-300" leave="ease-in duration-200"
            enterFrom="opacity-0" enterTo="opacity-100"
            leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300" leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white p-6 rounded shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center px-4 py-2 text-white"
                  style={{ backgroundColor: "#c87b17" }}>
                  <h4 className="text-xl font-bold">{modalItem?.name}</h4>
                </div>
                {modalType === "weapon" ? (
                  <WeaponDetail item={modalItem} />
                ) : (
                  <ArmorDetail item={modalItem} />
                )}
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => addEquipment(modalItem, modalType)}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                        if (canAfford(modalItem.cost)) {
                          const costInCopper = Math.round(modalItem.cost * 100);

                          const { gp = 0, sp = 0, cp = 0 } = characterData.coins || {};
                          let totalCopper = gp * 100 + sp * 10 + cp;

                          totalCopper -= costInCopper;

                          const newGp = Math.floor(totalCopper / 100);
                          const newSp = Math.floor((totalCopper % 100) / 10);
                          const newCp = totalCopper % 10;

                          updateCharacterData("coins", { gp: newGp, sp: newSp, cp: newCp });
                          addEquipment(modalItem, modalType);
                          closeModal();
                        }
                      }}
                    className={`px-4 py-1 rounded ${canAfford(modalItem?.cost) ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    disabled={!canAfford(modalItem?.cost)}
                  >
                    Buy ({modalItem?.cost} gp)
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={sellModalOpen} as={React.Fragment}>
        <Dialog onClose={() => setSellModalOpen(false)} className="relative z-10">
          <Transition.Child
            enter="ease-out duration-300" leave="ease-in duration-200"
            enterFrom="opacity-0" enterTo="opacity-100"
            leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300" leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white p-6 rounded shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center px-4 py-2 text-white"
                  style={{ backgroundColor: "#8b1c13" }}>
                  <h4 className="text-xl font-bold">{selectedOwnedItem?.name}</h4>
                </div>

                {selectedOwnedType === "weapon" ? (
                  <WeaponDetail item={selectedOwnedItem} />
                ) : (
                  <ArmorDetail item={selectedOwnedItem} />
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      handleSell(1);
                    }}
                    className="bg-red-500 text-white hover:bg-red-600 px-4 py-1 rounded"
                    disabled={!selectedOwnedItem}
                  >
                    Sell 1 ({Math.floor((selectedOwnedItem?.cost || 0))} gp)
                  </button>

                  {selectedOwnedCount > 1 && (
                    <button
                      onClick={() => {
                        handleSell(selectedOwnedCount);
                      }}
                      className="bg-red-500 text-white hover:bg-red-600 px-4 py-1 rounded"
                    >
                      Sell All ({selectedOwnedCount} × {Math.floor((selectedOwnedItem?.cost || 0))} gp)
                    </button>
                  )}

                  <button
                    onClick={() => setSellModalOpen(false)}
                    className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

    </div>
    </div>
  );
}