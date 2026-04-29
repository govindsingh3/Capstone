/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Institution = require("../models/Institution");

const VALID_TYPES = new Set(["Central", "State", "Deemed", "Private"]);
const VALID_STATUS = new Set(["Active", "Dormant", "De-recognized"]);
const VALID_ZONE = new Set(["II", "III", "IV", "V"]);
const VALID_RISK = new Set(["Low", "Medium", "High"]);

const normalizeInput = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.institutions)) return payload.institutions;
  return [];
};

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsvToObjects = (csvText) => {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, key, index) => {
      acc[key] = values[index] ?? "";
      return acc;
    }, {});
  });
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const cleanEnum = (value, allowedSet, fallback) => {
  if (!value) return fallback;
  const candidate = String(value).trim();
  return allowedSet.has(candidate) ? candidate : fallback;
};

const normalizeInstitution = (entry) => {
  const institutionId = entry.institutionId || entry.institution_id || entry.code || "";
  const name = entry.name || entry.institutionName || entry.institution_name || "";
  const city = entry.city || "";
  const state = entry.state || "";
  const type = cleanEnum(entry.type, VALID_TYPES, "State");
  const website = entry.website || entry.website_url || "";
  const contactEmail = entry.contactEmail || entry.contact_email || "";
  const accreditation = entry.accreditation || "";
  const status = cleanEnum(entry.status, VALID_STATUS, "Active");

  const latitude = toNumber(entry.latitude || entry.lat);
  const longitude = toNumber(entry.longitude || entry.lng || entry.lon);

  const earthquakeZone = cleanEnum(
    entry.earthquakeZone || entry.earthquake_zone || entry["disasterMetadata.earthquakeZone"],
    VALID_ZONE,
    undefined
  );
  const floodRisk = cleanEnum(
    entry.floodRisk || entry.flood_risk || entry["disasterMetadata.floodRisk"],
    VALID_RISK,
    undefined
  );
  const cycloneRisk = cleanEnum(
    entry.cycloneRisk || entry.cyclone_risk || entry["disasterMetadata.cycloneRisk"],
    VALID_RISK,
    undefined
  );

  return {
    institutionId,
    name,
    city,
    state,
    type,
    website,
    contactEmail,
    accreditation,
    status,
    latitude,
    longitude,
    disasterMetadata: {
      earthquakeZone,
      floodRisk,
      cycloneRisk,
    },
  };
};

const loadInstitutionsFromFile = (resolvedPath) => {
  const extension = path.extname(resolvedPath).toLowerCase();

  if (extension === ".json") {
    const incoming = require(resolvedPath);
    return normalizeInput(incoming);
  }

  if (extension === ".csv") {
    const csvText = fs.readFileSync(resolvedPath, "utf-8");
    return parseCsvToObjects(csvText);
  }

  throw new Error("Unsupported format. Use .json or .csv");
};

const run = async () => {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: node src/scripts/importInstitutions.js <path-to-json-or-csv>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), fileArg);
  const incomingInstitutions = loadInstitutionsFromFile(resolvedPath);
  const institutions = incomingInstitutions.map(normalizeInstitution);

  if (institutions.length === 0) {
    console.error("No institutions found in input file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const operations = institutions
    .filter((item) => item && (item.institutionId || item.name))
    .map((item) => ({
      updateOne: {
        filter: item.institutionId ? { institutionId: item.institutionId } : { name: item.name },
        update: { $set: { ...item, lastAssessmentAt: new Date() } },
        upsert: true,
      },
    }));

  const result = await Institution.bulkWrite(operations, { ordered: false });
  console.log(
    JSON.stringify(
      {
        requested: institutions.length,
        processed: operations.length,
        source: path.extname(resolvedPath).toLowerCase().replace(".", ""),
        inserted: result.upsertedCount || 0,
        modified: result.modifiedCount || 0,
        matched: result.matchedCount || 0,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
