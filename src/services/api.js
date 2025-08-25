import axios from 'axios';
import AuthService from './auth.service.js';

// FIXED: Improved environment variable handling
const getApiBaseUrl = () => {
    // Check for environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback based on environment
    if (import.meta.env.DEV) {
        return 'http://localhost:10000/api';
    }
    
    // Production fallback
    return 'https://hr-backend-9ci3.onrender.com/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // FIXED: Increased timeout to 30 seconds for Render's cold starts
    withCredentials: false // FIXED: Explicitly set for CORS
});

// FIXED: Enhanced Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Log API calls in development
        if (import.meta.env.DEV) {
            console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
            if (config.data && config.method.toLowerCase() !== 'get') {
                console.log('Request data:', config.data);
            }
        }
        
        // Add auth token if available
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                if (userData && userData.token) {
                    config.headers['Authorization'] = `Bearer ${userData.token}`;
                }
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                localStorage.removeItem('user');
            }
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// FIXED: Enhanced Response Interceptor with better error handling
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
            if (response.data) {
                console.log('Response data:', response.data);
            }
        }
        return response;
    },
    (error) => {
        // FIXED: Enhanced error logging and handling
        if (error.response) {
            // Server responded with error status
            console.error(`API Error: ${error.response.status} ${error.response.config?.url}`);
            console.error('Error details:', error.response.data);
            
            // Handle specific error codes
            switch (error.response.status) {
                case 400:
                    console.error('Bad Request - Check your request data');
                    break;
                case 401:
                    console.error('Unauthorized - Invalid or expired token');
                    break;
                case 403:
                    console.error('Forbidden - Insufficient permissions');
                    break;
                case 404:
                    console.error('Not Found - Endpoint or resource not found');
                    break;
                case 409:
                    console.error('Conflict - Resource already exists');
                    break;
                case 500:
                    console.error('Internal Server Error');
                    break;
                default:
                    console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            }
        } else if (error.request) {
            // Network error - no response received
            console.error('Network Error - No response received:', error.request);
            console.error('Network error - check if backend is running and CORS is configured');
            
            // Check for specific network error types
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout - backend may be slow or unreachable');
            } else if (error.code === 'ERR_NETWORK') {
                console.error('Network error - check internet connection');
            }
        } else {
            // Request setup error
            console.error('Request setup error:', error.message);
        }

        const originalRequest = error.config;
        
        // FIXED: Handle 401 Unauthorized with auth check
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.error("API Interceptor: Received 401 Unauthorized. Logging out and redirecting.");
            
            // Only logout and redirect if we actually have auth data
            if (localStorage.getItem('user')) {
                AuthService.logout();
                // Only redirect to login if not already on login/register pages
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// FIXED: Add health check function
export const checkBackendHealth = async () => {
    try {
        const response = await axios.get(`${getApiBaseUrl().replace('/api', '')}/health`, {
            timeout: 10000
        });
        console.log('Backend health check successful:', response.status);
        return true;
    } catch (error) {
        console.error('Backend health check failed:', error.message);
        return false;
    }
};

export default api;