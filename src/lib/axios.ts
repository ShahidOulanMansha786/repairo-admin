import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// Disputes
export const getDisputeStats = () =>
    api.get("/admin/disputes/stats");

export const getDisputes = (params: {
    page?: number;
    size?: number;
    status?: string
}) => api.get("/admin/disputes", { params });

export const resolveDispute = (
    disputeId: number,
    data: { resolution: "RESOLVED_SHOP" | "RESOLVED_OWNER"; adminNote: string }
) => api.post(`/admin/disputes/${disputeId}/resolve`, data);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(null);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(original))
                    .catch(() => {
                        window.location.href = "/login";
                    });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                const refreshRes = await fetch("/api/admin/refresh", {
                    method: "POST",
                });

                if (refreshRes.ok) {
                    processQueue(null);
                    return api(original);
                }

                throw new Error("Refresh failed");

            } catch (err) {
                processQueue(err);
                window.location.href = "/login";
                return Promise.reject(err);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;