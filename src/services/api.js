import axios from 'axios';
import AuthService from './auth.service.js';

// FIXED: Removed double slash and improved environment variable handling
const getApiBaseUrl = () => {
    // Check for environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback based on environment
    if (import.meta.env.DEV) {
        return 'http://localhost:3000/api';
    }
    
    // Production fallback
    return 'https://hr-backend-9ci3.onrender.com/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout for Render's cold starts
});

// Enhanced Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Log API calls in development
        if (import.meta.env.DEV) {
            console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                if (userData && userData.token) {
                    config.headers['Authorization'] = `Bearer ${userData.token}`;
                }
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                localStorage.removeItem('user'); // Clean up corrupted data
            }
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Enhanced Response Interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        // Enhanced error logging
        if (error.response) {
            console.error(`API Error: ${error.response.status} ${error.response.config?.url}`, error.response.data);
        } else if (error.request) {
            console.error('Network Error - No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }

        const originalRequest = error.config;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.error("API Interceptor: Received 401 Unauthorized. Logging out and redirecting.");
            AuthService.logout();
            window.location.href = '/login';
        }
        
        // Handle network errors (server down, CORS issues, etc.)
        if (!error.response) {
            console.error('Network error - check if backend is running and CORS is configured');
        }
        
        return Promise.reject(error);
    }
);

export default api;