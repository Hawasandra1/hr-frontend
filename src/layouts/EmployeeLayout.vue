<template>
  <v-app>
    <!-- Side Navigation Drawer -->
    <v-navigation-drawer
      app
      class="gradient-nav"
      dark
      permanent
    >
      <!-- Logo -->
      <v-list-item to="/" link class="pa-4">
        <v-list-item-content>
          <v-list-item-title class="d-flex justify-center align-center">
            <span class="font-weight-bold text-h5">Frochi</span>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Navigation Links for Employees -->
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

      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn text v-bind="props" class="ml-4">
            <v-avatar size="36" class="mr-2">
              <v-img src="/images/default-avatar.png"></v-img>
            </v-avatar>
            <span>{{ currentUser.firstName }}</span>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <!-- UPDATED: Link now points to the named route -->
          <v-list-item :to="{ name: 'EmployeeProfile' }">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/auth.service';

const router = useRouter();
const currentUser = ref({ firstName: 'Employee', role: '' });

// 1. Set the default to your new generic icon
const profilePic = ref('/images/default-avatar.png');

// Navigation items specific to the Employee role
const navItems = ref([
  { title: 'My Leave', icon: 'mdi-calendar-arrow-right', to: '/employee/my-leave' },
  { title: 'My Payslips', icon: 'mdi-cash-multiple', to: '/employee/my-payslips' },
]);

onMounted(() => {
  const user = AuthService.getCurrentUser();
  if (user) {
    currentUser.value = user;

    // 2. ADDED: Check if the user has a real profile picture URL.
    // If they do, update profilePic to use it instead of the default.
    if (user.profilePictureUrl) {
      profilePic.value = user.profilePictureUrl;
    }
  }
});

const handleLogout = () => {
  AuthService.logout();
  router.push('/login');
};
</script>
