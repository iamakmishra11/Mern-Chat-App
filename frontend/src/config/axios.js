    import axios from 'axios';

    const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Backend URL from environment variable
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        }
        return Promise.reject(error);
    }
    );

    export default axiosInstance;
