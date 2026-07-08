import { escrowApi } from "./api";

export const getEscrowOverview = async () => {
  const { data } = await escrowApi.get("/");
  return data;
};

export const lockFunds = async (payload) => {
  const { data } = await escrowApi.post("/lock-funds", payload);
  return data;
};

export const releaseFunds = async (payload) => {
  const { data } = await escrowApi.post("/release-funds", payload);
  return data;
};

export const getEscrow = async () => {
  const { data } = await escrowApi.get("/escrow");
  return data;
};

export const getEscrowByTaskId = async (taskId) => {
  const { data } = await escrowApi.get(`/escrow/${taskId}`);
  return data;
};

export const getTransactions = async () => {
  const { data } = await escrowApi.get("/transactions");
  return data;
};

export const getEscrowAgentCard = async () => {
  try {
    const { data } = await escrowApi.get("/agent-card");
    return data;
  } catch {
    const { data } = await escrowApi.get("/.well-known/agent.json");
    return data;
  }
};