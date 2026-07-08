import axios from "axios";

const DEFAULT_TIMEOUT = 30000;

const SERVICE_URLS = {
  client: import.meta.env.VITE_CLIENT_AGENT_URL || "http://localhost:8000",
  worker: import.meta.env.VITE_WORKER_AGENT_URL || "http://localhost:8001",
  verifier: import.meta.env.VITE_VERIFIER_AGENT_URL || "http://localhost:8002",
  escrow: import.meta.env.VITE_ESCROW_SERVICE_URL || "http://localhost:8003",
};

const createClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const clientApi = createClient(SERVICE_URLS.client);
export const workerApi = createClient(SERVICE_URLS.worker);
export const verifierApi = createClient(SERVICE_URLS.verifier);
export const escrowApi = createClient(SERVICE_URLS.escrow);

export { SERVICE_URLS };