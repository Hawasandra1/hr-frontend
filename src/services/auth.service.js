import api from './api.js';

class AuthService {
    // ... (your existing login, register, etc. methods)

    // ADD THIS NEW METHOD FOR EMPLOYEES
    async changeEmployeePassword(passwordData) {
        return api.put('/employees/my-profile/change-password', passwordData);
    }

    // ADD THIS NEW METHOD FOR EMPLOYEES
    async uploadEmployeeProfilePicture(formData) {
        const response = await api.post('/employees/my-profile/upload-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Update user in local storage
        if (response.data.profilePicture) {
            this.updateUserProfile({ profilePictureUrl: response.data.profilePicture });
        }
        return response.data;
    }
    
    // This existing method is for Admins, we will leave it as is
    async changeUserPassword(passwordData) {
        return api.put('/users/my-profile/change-password', passwordData); // Assuming this is your admin route
    }
    
    // This existing method is for Admins
    async uploadUserProfilePicture(formData) {
        const response = await api.post('/users/my-profile/upload-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.profilePicture) {
            this.updateUserProfile({ profilePictureUrl: response.data.profilePicture });
        }
        return response.data;
    }
    // FIXED: Enhanced register method with better validation and error handling
    async register(userData) {
        try {
            // FIXED: Validate required fields before sending (matching Employee model)
            const requiredFields = ['firstName', 'lastName', 'email', 'password'];
            const missingFields = requiredFields.filter(field => !userData[field] || userData[field].trim() === '');
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // FIXED: Prepare clean data object (matching Employee model - NO username field)
            const registrationData = {
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                position: userData.position || 'Employee', // Required field with default
                role: userData.role || 'Employee' // Default role
            };

            console.log('Attempting registration for:', registrationData.email);
            console.log('Registration payload:', {
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                email: registrationData.email,
                position: registrationData.position,
                role: registrationData.role,
                hasPassword: !!registrationData.password
            });
            
            const response = await api.post('/auth/register', registrationData);
            
            console.log('Registration API response:', response.data);

            // FIXED: Handle different response formats from backend
            if (response.data) {
                // If backend returns token and user, auto-login
                if (response.data.token && response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    console.log('Registration and auto-login successful:', response.data.user.email);
                    return response.data;
                }
                // If backend just confirms registration without auto-login
                else if (response.data.message || response.data.success) {
                    console.log('Registration successful, manual login required');
                    return response.data;
                }
                // Generic success response
                else {
                    console.log('Registration completed successfully');
                    return response.data;
                }
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // FIXED: Better error handling with specific messages
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Registration failed - please check your information';
                throw new Error(errorMessage);
            } else if (error.response?.status === 409) {
                throw new Error('Email or username already exists. Please try different credentials.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error - please try again later');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout - please check your connection and try again');
            } else if (!error.response) {
                throw new Error('Network error - unable to reach server. Please try again.');
            } else {
                throw error;
            }
        }
    }

    // FIXED: Enhanced registerAdmin method
    async registerAdmin(userData) {
        try {
            console.log('Attempting to register admin user:', userData.email);
            
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const response = await api.post('/auth/register-admin', userData);
            console.log('Admin user registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Admin registration error:', error);
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
        try {
            api.post('/auth/logout').catch(() => {
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
        const userRole = this.getUserRole(); // Use your existing helper to get the role

        let response;

        // Check the user's role and call the correct endpoint
        if (userRole === 'Employee') {
            console.log('Fetching profile from EMPLOYEE endpoint...');
            response = await api.get('/employees/my-profile');
        } else if (userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager') {
            console.log('Fetching profile from ADMIN endpoint...');
            // NOTE: Use the correct route for an admin fetching their own profile.
            // Based on your router, you may need to create this route, e.g., in userRoutes.js
            // Let's assume the route is '/users/my-profile' for now.
            response = await api.get('/users/my-profile'); 
        } else {
            // If there's no role or an unknown role, throw an error.
            throw new Error('Cannot fetch profile: Unknown user role.');
        }
        
        // The rest of the logic to update localStorage remains the same and is great.
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            // The key in the response is 'user' for both endpoints.
            userData.user = response.data.user; 
            localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return response.data;

    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
}
// Add this login method to your AuthService class

async login(userData) {
    try {
        console.log('Attempting login for:', userData.email);
        
        // Validate required fields
        if (!userData.email || !userData.password) {
            throw new Error('Email and password are required');
        }

        // Prepare login data
        const loginData = {
            email: userData.email.trim().toLowerCase(),
            password: userData.password
        };

        console.log('Login payload:', { email: loginData.email, hasPassword: !!loginData.password });
        
        const response = await api.post('/auth/login', loginData);
        
        console.log('Login API response received:', response.data);

        if (response.data && response.data.token && response.data.user) {
            // Store user data and token in localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
            
            console.log('Login successful for user:', response.data.user.email, 'Role:', response.data.user.role);
            return response.data;
        } else {
            throw new Error('Invalid response format from server');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle different types of errors
        if (error.response?.status === 401) {
            throw new Error('Invalid email or password');
        } else if (error.response?.status === 404) {
            throw new Error('User not found');
        } else if (error.response?.status === 500) {
            throw new Error('Server error - please try again later');
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - please check your connection');
        } else if (!error.response) {
            throw new Error('Network error - unable to reach server');
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else {
            throw error;
        }
    }
}
}

export default new AuthService();
