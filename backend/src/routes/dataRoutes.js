const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { validate } = require("../middleware/validate");
const { institutionDataSchema, institutionsImportSchema } = require("../validators/dataSchemas");
const { upsertInstitution, listInstitutions, bulkImportInstitutions, bulkImportInstitutionsFile } = require("../controllers/dataController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });

router.get("/institutions", auth, listInstitutions);
router.post(
  "/institutions",
  auth,
  roleGuard(["Administrator", "Teacher", "DisasterOfficer"]),
  validate(institutionDataSchema),
  upsertInstitution
);

router.post(
  "/institutions/import",
  auth,
  roleGuard(["Administrator", "Teacher"]),
  validate(institutionsImportSchema),
  bulkImportInstitutions
);

router.post(
  "/institutions/import-file",
  auth,
  roleGuard(["Administrator", "Teacher"]),
  upload.single("file"),
  bulkImportInstitutionsFile
);

module.exports = router;
