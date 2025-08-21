<template>
  <v-app>
    <!-- Side Navigation Drawer -->
    <v-navigation-drawer
      app
      class="gradient-nav"
      dark
      permanent
    >
      <v-list-item to="/" link class="pa-4">
        <v-list-item-content>
          <v-list-item-title class="d-flex justify-center align-center">
            <span class="font-weight-bold text-h5">Frochi</span>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :to="item.to"
          link
          class="nav-item"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Top App Bar -->
    <v-app-bar app color="white" flat class="border-b">
      <v-spacer></v-spacer>

      <!-- UPDATED: Notification Bell is now a dropdown menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-badge :model-value="notifications.length > 0" color="red" dot>
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-if="notifications.length === 0">
            <v-list-item-title>No new notifications</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="(notification, index) in notifications"
            :key="notification.id"
            @click="goToLeavePage"
          >
            <v-list-item-title>{{ notification.message }}</v-list-item-title>
            <template v-slot:append>
              <v-btn icon="mdi-close" size="x-small" variant="text" @click.stop="removeNotification(notification.id)"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <v-btn v-if="currentUser.role === 'Admin'" to="/app/create-user" color="primary" class="ml-4">
        <v-icon left class="mr-2">mdi-account-plus</v-icon>
        Create New User
      </v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn text v-bind="props" class="ml-4">
            <v-avatar size="36" class="mr-2">
              <v-img src="/images/default-avatar.jpg"></v-img>
            </v-avatar>
            <span>{{ currentUser.username }}</span>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="{ name: 'AdminProfile' }">
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content Area -->
    <v-main class="bg-grey-lighten-3">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/auth.service';

// NEW: Helper function to get the correct WebSocket URL based on environment
const getWebSocketUrl = () => {
  if (import.meta.env.DEV) {
    // We are in the local development environment
    return 'ws://localhost:3000';
  } else {
    // We are in production (deployed on Render)
    // Use the secure 'wss://' protocol and your backend's public URL
    return 'wss://hr-backend-9ci3.onrender.com';
  }
};

const router = useRouter();
const currentUser = ref({ username: 'Guest', role: '' });

// === THIS IS THE ONLY LINE THAT NEEDS TO BE CHANGED ===
const profilePic = ref('/images/default-avatar.png');

const notifications = ref([]);
let socket = null;

const navItems = ref([
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/app/dashboard' },
  { title: 'Employees', icon: 'mdi-account-group-outline', to: '/app/employees' },
  { title: 'Departments', icon: 'mdi-office-building-outline', to: '/app/departments' },
  { title: 'Projects', icon: 'mdi-briefcase-outline', to: '/app/projects' },
  { title: 'Payroll', icon: 'mdi-cash-multiple', to: '/app/payroll' },
  { title: 'Leave', icon: 'mdi-calendar-arrow-right', to: '/app/leave' },
]);

onMounted(() => {
  const user = AuthService.getCurrentUser();
  if (user) {
    currentUser.value = user;
    // This existing logic correctly overrides the default if a user has a picture
    if (user.profilePictureUrl) {
      profilePic.value = user.profilePictureUrl;
    }
  }

  // UPDATED: Use the helper function to get the dynamic URL
  const wsUrl = getWebSocketUrl();
  console.log(`Attempting WebSocket connection to: ${wsUrl}`);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => console.log('WebSocket connection established.');
  socket.onclose = () => console.log('WebSocket connection closed.');

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'NEW_LEAVE_REQUEST') {
      console.log('New leave request notification received!');
      notifications.value.push({
        id: Date.now(),
        message: data.payload.message,
        leaveId: data.payload.leaveId
      });
    }
  };
});

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});

const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id);
};

const goToLeavePage = () => {
  notifications.value = [];
  router.push('/app/leave');
};

const handleLogout = () => {
  AuthService.logout();
  router.push('/login');
};
</script>

<style>
/* Dark, professional gradient for the side navigation */
.gradient-nav {
  background: linear-gradient(160deg, #2c3e50 0%, #1a237e 100%) !important;
}

/* Ensures all text and icons in the nav are white */
.gradient-nav .v-list-item-title,
.gradient-nav .v-icon {
  color: white !important;
}

/* Styling for navigation items */
.nav-item .v-list-item-title {
  font-weight: 500;
}

/* Active (selected) navigation item style with a subtle background highlight */
.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.border-b {
  border-bottom: 1px solid #e0e0e0 !important;
}

.action-button {
  background: linear-gradient(to right, #2196F3, #64B5F6);
  color: white !important;
}
</style>
