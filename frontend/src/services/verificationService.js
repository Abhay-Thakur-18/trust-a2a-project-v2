import { verifierApi } from "./api";

export const verifyTask = async (payload) => {
  const { data } = await verifierApi.post("/verify", payload);
  return data;
};

export const getVerifications = async () => {
  const { data } = await verifierApi.get("/verifications");
  return data?.verifications || [];
};
