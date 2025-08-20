<template>
  <v-app>
    <v-main class="gradient-background">
      <!-- Hero Section -->
      <v-container class="fill-height text-center text-white">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8">
            <h1 class="text-h2 font-weight-bold mb-4 animate-fade-in-down">
              Welcome to Frochi
            </h1>
            <p class="text-h6 font-weight-light mb-8 animate-fade-in-up">
              The all-in-one solution to streamline your HR processes, from payroll to project management.
            </p>
            <v-btn
              color="white"
              to="/login"
              size="x-large"
              class="text-primary font-weight-bold animate-pulse"
            >
              Get Started
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- UPDATED: Features Section with improved spacing -->
        <!-- Features Section -->
    
    <!-- Features Section -->
    <v-container fluid class="py-12 bg-grey-lighten-4">
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 font-weight-bold mb-8">Core Features</h2>
        </v-col>
        <v-col 
          v-for="(feature, index) in features" 
          :key="feature.title" 
          cols="12" 
          md="4" 
          class="d-flex animate-feature-card"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <!-- UPDATED: Added 'align-center' to center the card's content -->
          <v-card class="pa-6 text-center rounded-lg d-flex flex-column align-center" elevation="2">
            <v-icon :icon="feature.icon" color="primary" size="64" class="mb-4"></v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
            <p class="flex-grow-1">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer/Contact Section -->
    <v-footer class="gradient-background text-white py-12">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="4" class="text-center text-md-left">
            <h3 class="text-h5 font-weight-bold mb-2">Frochi</h3>
            <p class="text-body-1">
              A comprehensive Human Resource Management system. It offers an intuitive interface for managing core HR functions.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <h4 class="text-h6 font-weight-bold mb-3">Get In Touch</h4>
            <div>
              <v-btn icon href="https://github.com/Hawasandra1" target="_blank" class="mx-2 social-icon">
                <v-icon>mdi-github</v-icon>
              </v-btn>
              <v-btn icon href="https://www.linkedin.com/in/hawasandra-mirambo-5b2419287/" target="_blank" class="mx-2 social-icon">
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
              <v-btn icon href="mailto:hawasandra.m@gmail.com" class="mx-2 social-icon">
                <v-icon>mdi-email</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <v-divider class="my-6" dark></v-divider>
        <v-row>
          <v-col class="text-center text-caption">
            © {{ new Date().getFullYear() }} Frochi.
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const features = ref([
  {
    icon: 'mdi-account-group-outline',
    title: 'Employee Management',
    description: 'Manage all employee records, statuses, and personal information in one centralized location.'
  },
  {
    icon: 'mdi-cash-multiple',
    title: 'Automated Payroll',
    description: 'Generate detailed payslips with automatic statutory deductions for PAYE and NSSF.'
  },
  {
    icon: 'mdi-calendar-arrow-right',
    title: 'Leave Tracking',
    description: 'A complete system for employees to request leave and for managers to approve or reject requests.'
  },
     {
    icon: 'mdi-briefcase-outline',
    title: 'Project Tracking',
    description: 'Create and assign company projects to specific employees, and monitor their status from the dashboard.'
  },
  {
    icon: 'mdi-shield-account',
    title: 'Role-Based Security',
    description: 'Secure, distinct permissions and layouts for Admin, HR, Manager, and Employee roles.'
  },
  {
    icon: 'mdi-chart-bar',
    title: 'Analytics Dashboard',
    description: 'Visualize key metrics and insights with an interactive dashboard for informed decision-making.'
  },

]);
</script>

<style scoped>
.gradient-background {
  background: linear-gradient(160deg, #2c3e50 0%, #1a237e 100%);
}

.text-white {
  color: white;
}

.fill-height {
  min-height: 80vh;
}

.social-icon {
  background-color: rgba(255, 255, 255, 0.938);
  transition: transform 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.2);
}

/* Simple Animations */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-fade-in-down {
  animation: fadeInDown 1s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out 0.5s forwards;
  opacity: 0;
}

.animate-pulse {
  animation: pulse 2s infinite ease-in-out 1.5s;
}

/* NEW: Animation for the feature cards */
.animate-feature-card {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0; /* Start hidden */
}
</style>
