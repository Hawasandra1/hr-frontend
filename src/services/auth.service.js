import api from './api.js';

class AuthService {
    // Login method
    async login(userData) {
        try {
            console.log('Attempting login for:', userData.email);
            
            const response = await api.post('/auth/login', userData);
            
            if (response.data && response.data.token && response.data.user) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                
                console.log('Login successful:', response.data.user.email, 'Role:', response.data.user.role);
                return response.data;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Clear any existing auth data on login failure
            this.logout();
            
            // Re-throw with better error message
            if (error.response?.data?.message) {
                throw error; // Let the component handle the server message
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                throw new Error('Network error - please check your connection and try again');
            } else {
                throw new Error('Login failed - please try again');
            }
        }
    }
 async registerAdmin(userData) {
      try {
        console.log('Attempting to register admin user:', userData.email);
        // This calls the specific backend route for creating users as an admin
        const response = await api.post('/auth/register-admin', userData);
        console.log('Admin user registration successful:', response.data);
        return response.data;
      } catch (error) {
        console.error('Admin registration error:', error);
        throw error; // Re-throw the error so the component can display a message
      }
    }
    // Register method
    async register(userData) {
        try {
            console.log('Attempting registration for:', userData.email);
            
            const response = await api.post('/auth/register', userData);
            
            if (response.data && response.data.token && response.data.user) {
                // Automatically log in after successful registration
                localStorage.setItem('user', JSON.stringify(response.data));
                console.log('Registration and login successful:', response.data.user.email);
                return response.data;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout method
    logout() {
        console.log('Logging out user');
        localStorage.removeItem('user');
        
        // Clear any cached user data
        this._currentUser = null;
        
        // Optional: Make API call to invalidate token on server
        // Note: Only do this if your backend supports token invalidation
        try {
            api.post('/auth/logout').catch(() => {
                // Ignore errors for logout API call
                console.log('Logout API call failed (this is okay)');
            });
        } catch (error) {
            // Ignore logout API errors
        }
    }

    // Get current user from localStorage
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                return userData.user || null;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Clean up corrupted data
            localStorage.removeItem('user');
        }
        return null;
    }

    // Get current token
    getToken() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                return userData.token || null;
            }
        } catch (error) {
            console.error('Error parsing token data:', error);
            localStorage.removeItem('user');
        }
        return null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // Basic token validation (check if it's not expired)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
                console.log('Token expired, logging out');
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
            return false;
        }
    }

    // Get user role
    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    // Check if user has specific role
    hasRole(roles) {
        const userRole = this.getUserRole();
        if (!userRole) return false;
        
        if (Array.isArray(roles)) {
            return roles.includes(userRole);
        }
        return userRole === roles;
    }

    // Update user profile in localStorage
    updateUserProfile(updatedUser) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                userData.user = { ...userData.user, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData.user;
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
        return null;
    }

    // Get profile method for API calls
    async getProfile() {
        try {
            const response = await api.get('/auth/me');
            
            // Update localStorage with fresh user data
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                userData.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
            }
            
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
}

export default new AuthService();