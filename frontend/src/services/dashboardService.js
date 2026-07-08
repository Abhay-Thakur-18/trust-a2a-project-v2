import { getClientAgentCard, getClientOverview, getTasks } from "./taskService";
import { getWorkerAgentCard, getWorkerOverview } from "./workerService";
import { getEscrow, getEscrowAgentCard, getEscrowOverview, getTransactions } from "./escrowService";
import { getAgentReputation } from "./reputationService";
import { getVerifications } from "./verificationService";

const normalizeCollection = (value, hint = "") => {
  if (Array.isArray(value)) return value;
  if (hint === "verifications" && Array.isArray(value?.verifications)) return value.verifications;
  if (Array.isArray(value?.transactions)) return value.transactions;
  if (Array.isArray(value?.tasks)) return value.tasks;
  if (Array.isArray(value?.verifications)) return value.verifications;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const getDashboardSnapshot = async () => {
  const [
    clientOverviewResult,
    workerOverviewResult,
    escrowOverviewResult,
    escrowResult,
    transactionsResult,
    tasksResult,
    clientCardResult,
    workerCardResult,
    escrowCardResult,
    reputationResult,
    verificationsResult,
  ] = await Promise.allSettled([
    getClientOverview(),
    getWorkerOverview(),
    getEscrowOverview(),
    getEscrow(),
    getTransactions(),
    getTasks(),
    getClientAgentCard(),
    getWorkerAgentCard(),
    getEscrowAgentCard(),
    getAgentReputation("worker-agent"),
    getVerifications(),
  ]);

  return {
    clientOverview: clientOverviewResult.status === "fulfilled" ? clientOverviewResult.value : null,
    workerOverview: workerOverviewResult.status === "fulfilled" ? workerOverviewResult.value : null,
    escrowOverview: escrowOverviewResult.status === "fulfilled" ? escrowOverviewResult.value : null,
    escrow: escrowResult.status === "fulfilled" ? escrowResult.value : null,
    transactions: transactionsResult.status === "fulfilled" ? normalizeCollection(transactionsResult.value, "transactions") : [],
    tasks: tasksResult.status === "fulfilled" ? normalizeCollection(tasksResult.value, "tasks") : [],
    reputation: reputationResult.status === "fulfilled" ? reputationResult.value : null,
    verifications: verificationsResult.status === "fulfilled" ? normalizeCollection(verificationsResult.value, "verifications") : [],
    agentCards: {
      client: clientCardResult.status === "fulfilled" ? clientCardResult.value : null,
      worker: workerCardResult.status === "fulfilled" ? workerCardResult.value : null,
      escrow: escrowCardResult.status === "fulfilled" ? escrowCardResult.value : null,
    },
  };
};
