import { workerApi } from "./api";

export const getWorkerOverview = async () => {
  const { data } = await workerApi.get("/");
  return data;
};

export const acceptTask = async (payload) => {
  const { data } = await workerApi.post("/accept-task", payload);
  return data;
};

export const getWorkerAgentCard = async () => {
  try {
    const { data } = await workerApi.get("/agent-card");
    return data;
  } catch {
    const { data } = await workerApi.get("/.well-known/agent.json");
    return data;
  }
};

export const getWorkers = async () => {
  const { data } = await workerApi.get("/workers");
  return data;
};
