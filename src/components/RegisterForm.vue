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
                <h1 class="text-h4 font-weight-bold">Join Us!</h1>
                <p class="text-subtitle-1">Create your employee account</p>
              </div>
              
              <v-form ref="form" @submit.prevent="handleRegister">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="firstName"
                      label="First Name"
                      prepend-inner-icon="mdi-account-outline"
                      variant="outlined"
                      :rules="nameRules"
                      required
                      :disabled="loading"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="lastName"
                      label="Last Name"
                      prepend-inner-icon="mdi-account-outline"
                      variant="outlined"
                      :rules="nameRules"
                      required
                      :disabled="loading"
                    ></v-text-field>
                  </v-col>
                </v-row>

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
                  <v-icon left>mdi-account-plus</v-icon>
                  Register
                </v-btn>
              </v-form>
              
              <div class="text-center mt-6">
                <p>Already have an account? 
                  <router-link to="/login" class="text-primary">
                    Sign In
                  </router-link>
                </p>
              </div>

              <!-- Development helper -->
              <div v-if="isDevelopment" class="mt-4 pa-3 border rounded">
                <p class="text-caption mb-2">Development Test Data:</p>
                <v-btn 
                  size="small" 
                  variant="outlined" 
                  @click="fillTestData"
                  class="mr-2 mb-2"
                >
                  Fill Test Data
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/auth.service';

// Reactive data
const form = ref(null);
const firstName = ref('');
const lastName = ref('');
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
const nameRules = [
  v => !!v || 'This field is required',
  v => v.length >= 2 || 'Name must be at least 2 characters'
];

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
  return firstName.value.length >= 2 && 
         lastName.value.length >= 2 && 
         email.value && 
         /.+@.+\..+/.test(email.value) && 
         password.value.length >= 6;
});

// Fill test data (development only)
const fillTestData = () => {
  firstName.value = 'John';
  lastName.value = 'Doe';
  email.value = 'john.doe@example.com';
  password.value = 'test123';
};

// Handle registration
const handleRegister = async () => {
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

    console.log('Attempting registration...');

    const userData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    };

    console.log('Registration data:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      hasPassword: !!userData.password
    });
    
    const response = await AuthService.register(userData);
    
    // Show success message
    message.value = 'Registration successful! Redirecting to login...';
    messageType.value = 'success';
    
    console.log('Registration successful:', response);
    
    // Wait a moment to show success message, then redirect
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle different types of errors
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else if (error.message) {
      message.value = error.message;
    } else {
      message.value = 'Registration failed. Please try again.';
    }
    
    messageType.value = 'error';
    
  } finally {
    loading.value = false;
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
  background: linear-gradient(to right, #4CAF50, #66BB6A) !important;
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
  color: #4CAF50 !important;
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
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}
</style>