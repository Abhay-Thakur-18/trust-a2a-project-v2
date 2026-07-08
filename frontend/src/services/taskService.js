import { clientApi } from "./api";

export const getClientOverview = async () => {
  const { data } = await clientApi.get("/");
  return data;
};

export const createTask = async (payload) => {
  const { data } = await clientApi.post("/create-task", payload, { timeout: 30000 });
  return data;
};

export const executeTask = async (taskId) => {
  const { data } = await clientApi.post(`/create-task/${taskId}/execute`, {}, { timeout: 180000 });
  return data;
};

export const resetPlatform = async () => {
  const { data } = await clientApi.post("/reset-platform");
  return data;
};

export const getClientAgentCard = async () => {
  try {
    const { data } = await clientApi.get("/agent-card");
    return data;
  } catch {
    const { data } = await clientApi.get("/.well-known/agent.json");
    return data;
  }
};

export const getDiscoveryAgent = async () => {
  try {
    const { data } = await clientApi.get("/discovery-agent");
    return data;
  } catch {
    const { data } = await clientApi.get("/discover-agents");
    return data;
  }
};

export const getTasks = async () => {
  const { data } = await clientApi.get("/tasks");
  return data?.tasks || [];
};

export const getTaskById = async (taskId) => {
  const { data } = await clientApi.get(`/tasks/${taskId}`);
  return data;
};
