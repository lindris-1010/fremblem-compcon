import initSqlJs from 'sql.js';

import charactersData from '../assets/debug_characters.json';
import classesData from '../assets/debug_classes.json';
import equipmentData from '../assets/debug_equipment.json';
import featsData from '../assets/debug_feats.json';
import powersData from '../assets/debug_powers.json';
import skillsData from '../assets/debug_skills.json';
import char_equipmentData from '../assets/debug_char_equipment.json';

import weaponProfiles from '../assets/weapon_profiles.json';
import armorProfiles from '../assets/armor_profiles.json';

// actual data
import clericData from '../assets/ClericPowersLvl1.json';
import fighterData from '../assets/FighterPowers.json';
import warlordData from '../assets/WarlordPowers.json';

function tryParse(val) {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

let db;
let dbReadyResolve;
export const ready = new Promise((resolve) => {
  dbReadyResolve = resolve;
});

export async function initDatabase() {
  const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
  db = new SQL.Database();

  // powers table
  db.run("CREATE TABLE IF NOT EXISTS powers (" +
      "power_id INTEGER PRIMARY KEY, " +
      "class_id INTEGER, " +
      "name TEXT NOT NULL, " +
      "level INTEGER NOT NULL,  " +
      "use_type TEXT CHECK(use_type IN ('at_will', 'encounter', 'daily')) NOT NULL, " +
      "action_type TEXT CHECK(action_type IN ('free', 'minor', 'standard')) NOT NULL, " +
      "keywords TEXT, " +
      "weapon TEXT, " +
      "target TEXT, " +
      "attack TEXT, " +
      "range TEXT, " +
      "effect TEXT, " +
      "description TEXT, " +
      "power_logic TEXT" +
    ");"
  );

  // Skills table
  db.run(
    "CREATE TABLE IF NOT EXISTS skills (" +
    "skill_id INTEGER PRIMARY KEY, " +
    "name TEXT, " +
    "ability_used TEXT CHECK(ability_used IN ('str', 'con', 'dex', 'int', 'wis', 'cha')) NOT NULL" +
    ");"
  );

  // Classes table
  db.run(
    "CREATE TABLE IF NOT EXISTS classes (" +
    "class_id INTEGER PRIMARY KEY, " +
    "name TEXT, " +
    "starting_hp INTEGER NOT NULL, " +
    "hp_per_level INTEGER NOT NULL, " +
    "healing_surges INTEGER NOT NULL, " +
    "weapon_prof TEXT, " +
    "armor_prof TEXT, " +
    "def_boosts TEXT, " +
    "starting_skill_ids TEXT, " +  // JSON array
    "trained_skill_ids TEXT, " +   // JSON array
    "description TEXT " +
    ");"
  );

  // Feats table
  db.run(
    "CREATE TABLE IF NOT EXISTS feats (" +
    "feat_id INTEGER PRIMARY KEY, " +
    "name TEXT, " +
    "description TEXT, " +
    "feat_logic TEXT" + // JSON
    ");"
  );

  // remove this
  // equipment table
  db.run(
    "CREATE TABLE IF NOT EXISTS equipment (" +
    "equipment_id INTEGER PRIMARY KEY, " +
    "name TEXT, " +
    "description TEXT, " +
    "mod INTEGER, " +
    "equipment_logic TEXT" + // JSON
    ");"
  );

  // characters table
  db.run(
    "CREATE TABLE IF NOT EXISTS characters (" +
    "character_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "class_id INTEGER, " +
    "str_score INTEGER, " +
    "con_score INTEGER, " +
    "dex_score INTEGER, " +
    "int_score INTEGER, " +
    "wis_score INTEGER, " +
    "cha_score INTEGER, " +
    "gp INTEGER, " +
    "sp INTEGER, " +
    "cp INTEGER, " +
    "skill_ids TEXT, " +   // JSON array
    "power_ids TEXT, " +   // JSON array
    "feat_ids TEXT, " +    // JSON array
    "name TEXT, " +
    "level INTEGER" +
    ");"
  );

  // weapon_profiles
  db.run(
    "CREATE TABLE IF NOT EXISTS weapon_profiles (" +
    "wp_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "name TEXT, " +
    "keywords TEXT, " +          // JSON array
    "cost INTEGER, " +
    "description TEXT, " +
    "damage TEXT, " +
    "type TEXT, " +              // JSON array
    "range INTEGER, " +
    "prof_bonus INTEGER" +
    ");"
  );

  // armor_profiles
  db.run(
    "CREATE TABLE IF NOT EXISTS armor_profiles (" +
    "ap_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "name TEXT, " +
    "keywords TEXT, " +          // JSON array
    "cost INTEGER, " +
    "description TEXT, " +
    "type TEXT, " +             // JSON array
    "ac_bonus INTEGER, " +
    "min_enhance_bonus INTEGER" +
    ");"
  );

  // char_equipment
  db.run(
    "CREATE TABLE IF NOT EXISTS char_equipment (" +
    "ce_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "char_id INTEGER, " +
    "profile_id INTEGER, " +
    "profile_type TEXT, " +      // 'weapon' or 'armor'
    "enchant_id INTEGER, " +
    "quantity INTEGER, " +
    "is_equipped INTEGER" +      // Use 0/1 for false/true
    ");"
  );

  return db;
}

// this is so we only load the data *once*
let dataLoaded = false;

// load in the debug data
export function loadSampleData() {
  if (dataLoaded) return;

  const tables = {
    skills: skillsData,
    powers: powersData,
    classes: classesData,
    feats: featsData,
    equipment: equipmentData,
    characters: charactersData,
    char_equipment: char_equipmentData,
    weapon_profiles: weaponProfiles,
    armor_profiles: armorProfiles
  };

  const power_tables = {
    clericData, fighterData, warlordData
  };

  Object.entries(tables).forEach(([table, rows]) => {
    rows.forEach(row => insertRow(table, row));
  });

  Object.values(power_tables).forEach(rows => {
    rows.forEach(row => insertRow('powers', row));
  });

  dataLoaded = true;
  dbReadyResolve();
}

// Insert a row into a table
export function insertRow(table, data) {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(key => typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);

  const stmt = db.prepare(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  );
  stmt.run(values);

  const insertedId = db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0];
  stmt.free();

  return insertedId;
}

// Get all rows
export function getAllRows(table) {
  const result = db.exec(`SELECT * FROM ${table}`);
  if (!result.length) return [];
  const columns = result[0].columns;
  return result[0].values.map(row =>
    Object.fromEntries(row.map((val, i) => [columns[i], tryParse(val)]))
  );
}

// Get one row by ID
export function getRowById(table, id) {
  const result = db.exec(`SELECT * FROM ${table} WHERE ${table.slice(0, -1)}_id = ${id}`);
  if (!result.length) return null;
  const columns = result[0].columns;
  const row = result[0].values[0];
  return Object.fromEntries(row.map((val, i) => [columns[i], tryParse(val)]));
}

// Delete by ID
export function deleteRowById(table, id) {
  db.run(`DELETE FROM ${table} WHERE ${table.slice(0, -1)}_id = ${id}`);
}

// Update by ID
export function updateRowById(table, id, newData) {
  const updates = Object.entries(newData).map(([key, value]) => {
    const v = typeof value === 'object' ? JSON.stringify(value) : value;
    return `${key} = ${typeof v === 'string' ? `'${v}'` : v}`;
  }).join(', ');
  db.run(`UPDATE ${table} SET ${updates} WHERE ${table.slice(0, -1)}_id = ${id}`);
}