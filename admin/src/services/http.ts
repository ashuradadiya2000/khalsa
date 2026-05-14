import axios from "axios";
import { toast } from "react-toastify";

import { authStorage } from "../utils/login";

export const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL_API,
});

instance.interceptors.request.use(
    (config) => {
        const tokenStr = "Bearer " + authStorage.authToken;
        if (authStorage.authToken) {
            config.headers["Authorization"] = tokenStr;
        }
        return config;
    },
    (error) => {
        console.log("error", error);
        Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status == 401) {
            authStorage.deleteAuthDetails();
            window.location.href = "/";
        }
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message);
        } else {
            toast.error(error?.data?.message);
        }
        return Promise.reject(error.response);
    }
);
