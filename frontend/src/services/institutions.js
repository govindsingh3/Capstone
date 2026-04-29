import api from "./api";

export const listInstitutions = async (params = {}) => {
  const response = await api.get("/api/v1/data/institutions", { params });
  return response.data;
};

export const uploadInstitutionsFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/v1/data/institutions/import-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
