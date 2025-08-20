<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 pa-4">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Employee Registration</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p class="text-center mb-4">Create your employee account.</p>
            <v-form ref="form" @submit.prevent="handleRegister">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    :rules="[v => !!v || 'First Name is required']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    :rules="[v => !!v || 'Last Name is required']"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="email"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="outlined"
                :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                required
                class="mt-2"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock-outline"
                type="password"
                variant="outlined"
                :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Password must be at least 6 characters']"
                required
                class="mt-2"
              ></v-text-field>
              
              <v-alert v-if="message" :type="successful ? 'success' : 'error'" class="mt-4">
                {{ message }}
              </v-alert>

              <v-btn
                :loading="loading"
                type="submit"
                color="primary"
                block
                large
                class="mt-4"
              >
                Register
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <p>Already have an account? <router-link to="/login">Log In</router-link></p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/auth.service';

const form = ref(null);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');

const loading = ref(false);
const successful = ref(false);
const message = ref('');
const router = useRouter();

// --- REVERTED TO ORIGINAL EMPLOYEE REGISTRATION LOGIC ---
const handleRegister = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  message.value = '';

  try {
    // This object is for a standard employee
    const userData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    };
    
    // This calls the public /api/auth/register endpoint for employees
    await AuthService.register(userData);
    
    successful.value = true;
    message.value = 'Registration successful! Redirecting to login...';

    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    message.value = error.response?.data?.message || 'An error occurred during registration.';
    successful.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
