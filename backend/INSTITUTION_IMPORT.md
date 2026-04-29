# Institution Import Guide

## Supported Formats

The importer supports:
- JSON (`.json`)
- CSV (`.csv`)

## Command

```bash
npm run import:institutions -- <path-to-file>
```

Examples:

```bash
npm run import:institutions -- ./src/data/institutionsCatalog.json
npm run import:institutions -- ./src/data/institutions-template.csv
```

## CSV Headers

Use this header row:

```text
institutionId,name,city,state,type,website,contactEmail,latitude,longitude,accreditation,status,earthquakeZone,floodRisk,cycloneRisk
```

Sample CSV file is provided at:
- `backend/src/data/institutions-template.csv`

## Notes

- Upsert key priority is `institutionId`; if missing, fallback is `name`.
- Allowed enums:
  - `type`: `Central`, `State`, `Deemed`, `Private`
  - `status`: `Active`, `Dormant`, `De-recognized`
  - `earthquakeZone`: `II`, `III`, `IV`, `V`
  - `floodRisk` and `cycloneRisk`: `Low`, `Medium`, `High`
- Invalid enum values are normalized to defaults (`type=State`, `status=Active`) or omitted for risk-zone fields.

## Browser Upload API

You can also upload files from the frontend via:

`POST /api/v1/data/institutions/import-file`

- Auth required.
- Roles: `Administrator`, `Teacher`.
- Multipart field name: `file`.
- Supported extensions: `.csv`, `.json`.
