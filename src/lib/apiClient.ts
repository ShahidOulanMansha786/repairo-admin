import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const tokenResponse = await fetch("/api/admin/token");
    const data = await tokenResponse.json();

    if (data.accessToken) {
        config.headers["Authorization"] = `Bearer ${data.accessToken}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshResponse = await fetch("/api/admin/refresh", {
                method: "POST",
            });

            if (refreshResponse.ok) {
                const tokenResponse = await fetch("/api/admin/token");
                const data = await tokenResponse.json();

                originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            }

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default apiClient;