import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8002",
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed() {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                axios.post("http://localhost:8002/refresh", {}, { withCredentials: true })
                    .then(() => {
                        isRefreshing = false;
                        onRefreshed();
                    })
                    .catch(() => {
                        isRefreshing = false;
                        refreshSubscribers = [];
                        // ONLY redirect if not already on /login — this breaks the loop
                        if (window.location.pathname !== "/login") {
                            window.location.href = "/login";
                        }
                    });
            }

            return new Promise((resolve) => {
                subscribeTokenRefresh(() => {
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);
export default api;