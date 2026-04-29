const Institution = require("../models/Institution");
const { asyncHandler } = require("../utils/asyncHandler");
const { institutionsCatalog } = require("../data/institutionsCatalog");

const VALID_TYPES = new Set(["Central", "State", "Deemed", "Private"]);
const VALID_STATUS = new Set(["Active", "Dormant", "De-recognized"]);
const VALID_ZONE = new Set(["II", "III", "IV", "V"]);
const VALID_RISK = new Set(["Low", "Medium", "High"]);

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

const toBulkOperations = (entries) =>
  entries
    .filter((item) => item && (item.institutionId || item.name))
    .map((item) => {
      const payload = { ...item, lastAssessmentAt: new Date() };
      const filter = item.institutionId ? { institutionId: item.institutionId } : { name: item.name };
      return {
        updateOne: {
          filter,
          update: { $set: payload },
          upsert: true,
        },
      };
    });

const seedInstitutionsIfEmpty = async () => {
  const count = await Institution.estimatedDocumentCount();
  if (count > 0) return;
  await Institution.insertMany(institutionsCatalog, { ordered: false });
};

const upsertInstitution = asyncHandler(async (req, res) => {
  const payload = { ...req.body, lastAssessmentAt: new Date() };
  const lookup = req.body.institutionId
    ? { institutionId: req.body.institutionId }
    : { name: req.body.name };

  const institution = await Institution.findOneAndUpdate(
    lookup,
    payload,
    { new: true, upsert: true }
  );
  res.json(institution);
});

const bulkImportInstitutions = asyncHandler(async (req, res) => {
  const entries = Array.isArray(req.body?.institutions) ? req.body.institutions : [];
  if (entries.length === 0) {
    return res.status(400).json({ message: "institutions array is required" });
  }

  const operations = toBulkOperations(entries.map(normalizeInstitution));

  if (operations.length === 0) {
    return res.status(400).json({ message: "No valid institutions in payload" });
  }

  const result = await Institution.bulkWrite(operations, { ordered: false });
  return res.json({
    message: "Institution import completed",
    requested: entries.length,
    processed: operations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0,
  });
});

const bulkImportInstitutionsFile = asyncHandler(async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ message: "Upload a CSV or JSON file in 'file' field" });
  }

  const extension = (uploadedFile.originalname || "").toLowerCase();
  let entries = [];

  if (extension.endsWith(".csv")) {
    const csvText = uploadedFile.buffer.toString("utf-8");
    entries = parseCsvToObjects(csvText).map(normalizeInstitution);
  } else if (extension.endsWith(".json")) {
    const parsed = JSON.parse(uploadedFile.buffer.toString("utf-8"));
    const rawEntries = Array.isArray(parsed) ? parsed : parsed?.institutions;
    entries = Array.isArray(rawEntries) ? rawEntries.map(normalizeInstitution) : [];
  } else {
    return res.status(400).json({ message: "Only .csv and .json files are supported" });
  }

  if (entries.length === 0) {
    return res.status(400).json({ message: "No institution rows found in file" });
  }

  const operations = toBulkOperations(entries);
  if (operations.length === 0) {
    return res.status(400).json({ message: "No valid institutions in file" });
  }

  const result = await Institution.bulkWrite(operations, { ordered: false });
  return res.json({
    message: "Institution file import completed",
    filename: uploadedFile.originalname,
    requested: entries.length,
    processed: operations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0,
  });
});

const listInstitutions = asyncHandler(async (req, res) => {
  await seedInstitutionsIfEmpty();

  const {
    q,
    state,
    type,
    earthquakeZone,
    floodRisk,
    page = "1",
    limit = "20",
  } = req.query;

  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const filters = {};
  if (q) {
    filters.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { state: { $regex: q, $options: "i" } },
      { institutionId: { $regex: q, $options: "i" } },
    ];
  }
  if (state) filters.state = state;
  if (type) filters.type = type;
  if (earthquakeZone) filters["disasterMetadata.earthquakeZone"] = earthquakeZone;
  if (floodRisk) filters["disasterMetadata.floodRisk"] = floodRisk;

  const [items, total] = await Promise.all([
    Institution.find(filters)
      .sort({ name: 1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Institution.countDocuments(filters),
  ]);

  res.json({
    items,
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit),
    },
  });
});

module.exports = { upsertInstitution, listInstitutions, bulkImportInstitutions, bulkImportInstitutionsFile };
