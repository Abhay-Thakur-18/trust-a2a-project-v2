import { clientApi } from "./api";

const normalizeReputation = (data) => ({
  agent_id: data?.agent_id,
  score: Number(data?.score ?? data?.reputation_score ?? 100),
  success_count: Number(data?.success_count ?? data?.success ?? 0),
  failure_count: Number(data?.failure_count ?? data?.failure ?? 0),
  total_events: Number(data?.total_events ?? (Number(data?.success_count ?? data?.success ?? 0) + Number(data?.failure_count ?? data?.failure ?? 0))),
  success_rate: Number(data?.success_rate ?? 100),
});

export const getAgentReputation = async (agentId = "worker-agent") => {
  const { data } = await clientApi.get(`/reputation/${agentId}`);
  return normalizeReputation(data);
};

export const getAllReputations = async () => {
  const { data } = await clientApi.get("/reputations");
  return (data?.reputations || []).map(normalizeReputation);
};
