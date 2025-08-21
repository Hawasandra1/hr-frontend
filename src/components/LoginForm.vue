<template>
  <v-app>
    <v-main class="gradient-background d-flex align-center justify-center">
      <!-- Back to Home link -->
      <router-link to="/" class="back-link-corner">
        <v-icon small>mdi-arrow-left</v-icon>
        Back to Home
      </router-link>

      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-8 rounded-lg" elevation="12" dark>
              <div class="text-center mb-6">
                <h1 class="text-h4 font-weight-bold">Welcome!</h1>
                <p class="text-subtitle-1">Sign in to continue</p>
              </div>
              
              <v-form ref="form" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                  class="mb-4"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                  class="mb-4"
                  :disabled="loading"
                ></v-text-field>

                <v-alert v-if="message" :type="messageType" class="mb-4">
                  {{ message }}
                </v-alert>

                <v-btn
                  :loading="loading"
                  type="submit"
                  block
                  size="x-large"
                  class="action-button font-weight-bold"
                  :disabled="!isFormValid"
                >
                  <v-icon left>mdi-login</v-icon>
                  Log In
                </v-btn>
              </v-form>
              
              <div class="text-center mt-6">
                <p>Don't have an account? 
                  <router-link to="/register" class="text-primary">
                    Register
                  </router-link>
                </p>
              </div>

              <!-- Development helper -->
              <div v-if="isDevelopment" class="mt-4 pa-3 border rounded">
                <p class="text-caption mb-2">Development Test Credentials:</p>
                <v-btn 
                  size="small" 
                  variant="outlined" 
                  @click="fillTestCredentials"
                  class="mr-2 mb-2"
                >
                  Admin Test
                </v-btn>
                <p class="text-caption">Email: admin@gmail.com | Password: 1234.xyz</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import  AuthService  from '@/services/auth.service';
// Reactive data
const form = ref(null);
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const message = ref('');
const messageType = ref('error');
const router = useRouter();

// Environment check
const isDevelopment = computed(() => import.meta.env.DEV);

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

// Form validation
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         /.+@.+\..+/.test(email.value) && 
         password.value.length >= 6;
});

// Fill test credentials (development only)
const fillTestCredentials = () => {
  email.value = 'admin@gmail.com';
  password.value = '1234.xyz';
};

// Check if user is already logged in
onMounted(() => {
  if (AuthService.isAuthenticated()) {
    const user = AuthService.getCurrentUser();
    if (user) {
      redirectUser(user.role);
    }
  }
});

// Handle login
const handleLogin = async () => {
  try {
    // Validate form
    const { valid } = await form.value.validate();
    if (!valid) {
      message.value = 'Please fix the form errors';
      messageType.value = 'error';
      return;
    }

    loading.value = true;
    message.value = '';

    console.log('Attempting login...');

    const userData = {
      email: email.value.trim(),
      password: password.value,
    };
    
    const response = await AuthService.login(userData);
    
    // Show success message briefly
    message.value = 'Login successful! Redirecting...';
    messageType.value = 'success';
    
    console.log('Login response:', response.user.role);
    
    // Wait a moment to show success message
    setTimeout(() => {
      redirectUser(response.user.role);
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different types of errors
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else if (error.message) {
      message.value = error.message;
    } else {
      message.value = 'Login failed. Please check your credentials and try again.';
    }
    
    messageType.value = 'error';
    
    // Clear password field on error
    password.value = '';
    
  } finally {
    loading.value = false;
  }
};

// Redirect user based on role
const redirectUser = (userRole) => {
  console.log('Redirecting user with role:', userRole);
  
  try {
    if (['Admin', 'HR', 'Manager'].includes(userRole)) {
      window.location.href = '/app/dashboard';
    } else if (userRole === 'Employee') {
      window.location.href = '/employee/my-leave';
    } else {
      console.warn('Unknown role:', userRole);
      window.location.href = '/app'; // Fallback
    }
  } catch (error) {
    console.error('Redirect error:', error);
    // Fallback redirect
    window.location.href = '/app';
  }
};
</script>

<style scoped>
.gradient-background {
  background: linear-gradient(160deg, #2c3e50 0%, #1a237e 100%);
  min-height: 100vh;
  position: relative;
}

.action-button {
  background: linear-gradient(to right, #2196F3, #64B5F6) !important;
  color: white !important;
  transition: transform 0.2s ease-in-out;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.6;
  transform: none;
}

.text-primary {
  color: #2196F3 !important;
  text-decoration: none;
}

.text-primary:hover {
  text-decoration: underline;
}

.back-link-corner {
  position: absolute;
  top: 24px;
  left: 24px;
  text-decoration: none;
  color: #FFFFFF !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  transition: color 0.2s ease;
}

.back-link-corner:hover {
  text-decoration: underline;
  color: #64B5F6 !important;
}

/* Development helper styles */
.border {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.v-alert {
  margin-bottom: 16px;
}

/* Loading state improvements */
.v-btn--loading {
  pointer-events: none;
}

/* Form field focus states */
.v-text-field--focused {
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}
</style>