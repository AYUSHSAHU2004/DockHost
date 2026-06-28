import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8002",
    withCredentials: true
});

// Request Interceptor
api.interceptors.request.use((config) => {

    const userInfo = JSON.parse(
        localStorage.getItem("user-info")
    );

    if (userInfo?.token) {

        config.headers.Authorization =
            `Bearer ${userInfo.token}`;

    }

    return config;

});

// Response Interceptor
api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {

                const { data } = await axios.post(
                    "http://localhost:8002/refresh",
                    {},
                    {
                        withCredentials: true
                    }
                );

                console.log("Refresh endpoint called");

                const userInfo = JSON.parse(
                    localStorage.getItem("user-info")
                );

                userInfo.token = data.token;

                localStorage.setItem(
                    "user-info",
                    JSON.stringify(userInfo)
                );

                originalRequest.headers.Authorization =
                    `Bearer ${data.token}`;

                return api(originalRequest);

            } catch (err) {

                localStorage.removeItem("user-info");

                window.location.href = "/login";

                return Promise.reject(err);

            }

        }

        return Promise.reject(error);

    }

);

export default api;