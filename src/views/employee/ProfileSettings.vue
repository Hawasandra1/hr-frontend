<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-6">My Profile</h1>
    <v-row>
      <!-- Profile Picture Section -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 text-center">
          <v-avatar size="150" class="mb-4">
            <v-img :src="profilePictureUrl || defaultAvatar" alt="Profile Picture"></v-img>
          </v-avatar>
          <v-file-input
            label="Upload new picture"
            variant="outlined"
            @change="onFileChange"
            accept="image/*"
          ></v-file-input>
          <v-btn @click="uploadPicture" :loading="uploading" color="primary" class="mt-2">
            Save Picture
          </v-btn>
        </v-card>
      </v-col>

      <!-- Change Password Section -->
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h6">Change Password</v-card-title>
          <v-card-text>
            <v-form ref="passwordForm" @submit.prevent="handleChangePassword">
              <v-text-field
                v-model="passwords.oldPassword"
                label="Old Password"
                type="password"
                variant="outlined"
                :rules="[v => !!v || 'Old password is required']"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="passwords.newPassword"
                label="New Password"
                type="password"
                variant="outlined"
                :rules="[v => !!v || 'New password is required']"
                class="mb-4"
              ></v-text-field>
              <v-btn type="submit" color="primary" :loading="passwordLoading">
                Update Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import employeeService from '@/services/employee.service';
import AuthService from '@/services/auth.service';

// 1. HELPER: Create a dynamic base URL for your backend API
const getApiBaseUrl = () => {
  // Use Vite's environment variables to detect if we are in development or production
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'; // Your local backend URL
  } else {
    return 'https://hr-backend-9ci3.onrender.com'; // Your deployed backend URL
  }
};
const API_BASE_URL = getApiBaseUrl();


const passwordForm = ref(null);
const passwords = ref({ oldPassword: '', newPassword: '' });
const passwordLoading = ref(false);

const selectedFile = ref(null);
const uploading = ref(false);
const profilePictureUrl = ref('');

// 2. CHANGED: Update the default avatar to your local asset
const defaultAvatar = '/images/default-avatar.png';

const snackbar = ref({ show: false, message: '', color: '' });

onMounted(async () => {
    const user = AuthService.getCurrentUser();
    if (user && user.profilePictureUrl) {
        // 3. CHANGED: Use the dynamic base URL to construct the image path
        profilePictureUrl.value = `${API_BASE_URL}${user.profilePictureUrl}`;
    }
});

const onFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadPicture = async () => {
  if (!selectedFile.value) {
    showSnackbar('Please select a file first.', 'warning');
    return;
  }
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('profilePicture', selectedFile.value);
    const response = await employeeService.uploadProfilePicture(formData);
    
    // 4. CHANGED: Use the dynamic base URL here as well
    profilePictureUrl.value = `${API_BASE_URL}${response.profilePictureUrl}`;

    showSnackbar('Profile picture updated!', 'success');
  } catch (error) {
    showSnackbar('Failed to upload picture.', 'error');
  } finally {
    uploading.value = false;
  }
};

const handleChangePassword = async () => {
  const { valid } = await passwordForm.value.validate();
  if (!valid) return;

  passwordLoading.value = true;
  try {
    await employeeService.changePassword(passwords.value);
    showSnackbar('Password changed successfully!', 'success');
    passwordForm.value.reset();
  } catch (error) {
    showSnackbar(error.response?.data?.message || 'Failed to change password.', 'error');
  } finally {
    passwordLoading.value = false;
  }
};

function showSnackbar(message, color) {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
}
</script>