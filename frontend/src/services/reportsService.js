import { getTasks } from "./taskService";
import { getVerifications } from "./verificationService";
import { getTransactions } from "./escrowService";

export const getReportsData = async () => {
  const [tasks, verifications, transactionsResult] = await Promise.all([
    getTasks(),
    getVerifications(),
    getTransactions(),
  ]);
  const reports = tasks.filter((t) => t.generated_report);
  const transactions = transactionsResult?.transactions || transactionsResult || [];
  return { tasks, verifications, reports, transactions };
};