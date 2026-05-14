const roleAccess = {
  Administrator: [
    "/",
    "/institution",
    "/simulation",
    "/ai-insights",
    "/learning",
    "/reports",
  ],
  Teacher: [
    "/",
    "/institution",
    "/simulation",
    "/ai-insights",
    "/learning",
    "/reports",
  ],
  DisasterOfficer: [
    "/",
    "/institution",
    "/simulation",
    "/ai-insights",
    "/reports",
  ],
  Student: ["/", "/learning"],
};

const roleAliasMap = {
  administrator: "Administrator",
  admin: "Administrator",
  teacher: "Teacher",
  coordinator: "Teacher",
  student: "Student",
  disasterofficer: "DisasterOfficer",
  disaster_officer: "DisasterOfficer",
  disasterofficerrole: "DisasterOfficer",
  disastermanagementofficer: "DisasterOfficer",
};

export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return null;
  if (roleAccess[role]) return role;

  const compact = role.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return roleAliasMap[compact] || null;
};

export const getAllowedPathsForRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized ? roleAccess[normalized] : ["/"];
};

export const canRoleAccessPath = (role, path) => getAllowedPathsForRole(role).includes(path);

export { roleAccess };
