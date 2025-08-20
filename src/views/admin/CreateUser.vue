<template>
  <v-container fluid>
    <h3 class="text-h4 font-weight-bold mb-6">Create a New User</h3>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-4 rounded-lg">
          <v-card-subtitle>
            Register a new HR, Manager, or Admin user.
          </v-card-subtitle>
          <v-card-text>
            <v-form ref="form" @submit.prevent="handleRegister">
              <v-text-field
                v-model="username"
                label="Username"
                variant="outlined"
                :rules="[v => !!v || 'Username is required']"
                required
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email Address"
                type="email"
                variant="outlined"
                :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                required
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                variant="outlined"
                :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Password must be at least 6 characters']"
                required
                class="mb-4"
              ></v-text-field>

              <v-select
                v-model="role"
                :items="['HR', 'Manager', 'Admin']"
                label="Role"
                variant="outlined"
                :rules="[v => !!v || 'Role is required']"
                required
                class="mb-4"
              ></v-select>

              <v-alert v-if="message" :type="successful ? 'success' : 'error'" class="mb-4">
                {{ message }}
              </v-alert>

              <v-btn
                :loading="loading"
                type="submit"
                color="primary"
                block
                large
              >
                Create User
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import AuthService from '@/services/auth.service';

const form = ref(null);
const username = ref('');
const email = ref('');
const password = ref('');
const role = ref('');

const loading = ref(false);
const successful = ref(false);
const message = ref('');

const handleRegister = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  message.value = '';

  try {
    const userData = {
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value,
    };
    
    const response = await AuthService.registerAdmin(userData);
    message.value = response.message;
    successful.value = true;
    form.value.reset();

 } catch (error) {
  // NEW: Log the entire error object to the browser console
  console.error("Create User Failed:", error);

  message.value = error.response?.data?.message || 'An error occurred.';
  successful.value = false;
  } finally {
    loading.value = false;
  }
};
</script>
