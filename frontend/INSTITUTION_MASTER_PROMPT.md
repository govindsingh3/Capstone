# Institution Page Master Prompt

Use this prompt when you want an AI to generate or expand production-grade institution data for DPRES.

```text
Act as a Senior Full-Stack Developer and Data Architect.
I am building a Disaster Preparedness and Response (DPRES) platform for Indian higher education institutions.

Task:
Create a production-ready institution dataset and API-ready schema for a real Institution page.

Requirements:
1. No dummy entities: include only real, verifiable Indian institutions.
2. Include unique `institutionId` for each record (UGC/AICTE code if available, otherwise stable canonical ID).
3. Include `name`, `city`, `state`, `type` (Central/State/Deemed/Private), `website`, and `contactEmail`.
4. Include geospatial fields: `latitude`, `longitude` (WGS84 decimal format).
5. Include risk metadata for DPRES scenarios:
   - `disasterMetadata.earthquakeZone` in [II, III, IV, V]
   - `disasterMetadata.floodRisk` in [Low, Medium, High]
   - `disasterMetadata.cycloneRisk` in [Low, Medium, High]
6. Include `accreditation` and `status` (Active/Dormant/De-recognized).
7. Return valid JSON array first, then API query examples.
8. Keep data realistic and consistent with public sources (UGC, NIRF, NAAC, IMD, NDMA references).
9. Add no fictional universities and no placeholder values like "abc@example.com".

Output format:
- Section 1: JSON array with 20 institutions
- Section 2: Validation checklist
- Section 3: Strategy to scale to 1000+ institutions from official sources
```

## What Changed In This Project

The current implementation now supports:
- Real-world institution metadata in backend schema.
- Search and filtering by state, type, earthquake zone, and flood risk.
- Pagination for scalable records.
- A seeded starter catalog in `backend/src/data/institutionsCatalog.js`.
