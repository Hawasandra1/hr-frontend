<template>
  <v-container fluid>
    <!-- Top Stat Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-lg gradient-blue">
          <div class="d-flex align-center">
            <v-avatar size="60" class="mr-4" color="rgba(255, 255, 255, 0.2)">
              <v-icon size="32" color="white">mdi-account-group-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ overview.totalEmployees }}</div>
              <div class="text-subtitle-1">Employees</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-lg gradient-orange">
          <div class="d-flex align-center">
            <v-avatar size="60" class="mr-4" color="rgba(255, 255, 255, 0.2)">
              <v-icon size="32" color="white">mdi-calendar-arrow-right</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ overview.totalLeaves }}</div>
              <div class="text-subtitle-1">Leaves</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-lg gradient-pink">
           <div class="d-flex align-center">
            <v-avatar size="60" class="mr-4" color="rgba(255, 255, 255, 0.2)">
              <v-icon size="32" color="white">mdi-briefcase-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ overview.totalProjects }}</div>
              <div class="text-subtitle-1">Projects</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Middle Section: Charts and Lists -->
    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card class="pa-4 rounded-lg fill-height">
          <v-card-title class="text-h6 font-weight-bold">Employee Distribution by Department</v-card-title>
          <v-card-text class="d-flex justify-center align-center">
            <Doughnut v-if="chartData.datasets[0].data.length" :data="chartData" :options="chartOptions" style="max-height: 300px;"/>
            <p v-else>No department data to display.</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-4 rounded-lg fill-height">
          <v-card-title class="text-h6 font-weight-bold">Upcoming Projects</v-card-title>
          <v-list>
            <v-list-item v-for="project in overview.upcomingProjects" :key="project.id">
              <v-list-item-title class="font-weight-medium">{{ project.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ project.startDate }}</v-list-item-subtitle>
            </v-list-item>
             <v-list-item v-if="!overview.upcomingProjects || overview.upcomingProjects.length === 0">
              <v-list-item-title>No upcoming projects.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom Section: Quick Actions -->
    <v-row class="mt-4">
        <v-col cols="12">
            <v-card class="pa-4 rounded-lg">
                <v-card-title class="text-h6 font-weight-bold">Quick Actions</v-card-title>
                <v-card-actions>
                    <v-btn color="primary" to="/app/payroll" size="large">View Payroll</v-btn>
                    <v-btn color="red" to="/app/employees" size="large">Manage Employees</v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DashboardService from '@/services/dashboard.service';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const overview = ref({
  totalEmployees: 0,
  totalLeaves: 0,
  totalProjects: 0,
  upcomingProjects: [],
});
const departmentDistribution = ref([]);

onMounted(async () => {
  try {
    const [overviewData, departmentData] = await Promise.all([
      DashboardService.getEmployeesOverview(),
      DashboardService.getDepartmentEmployeeDistribution(),
    ]);
    overview.value = overviewData;
    departmentDistribution.value = departmentData;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
});

const chartData = computed(() => ({
  labels: departmentDistribution.value.map(d => d.name),
  datasets: [
    {
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
      data: departmentDistribution.value.map(d => d.count),
    },
  ],
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
});
</script>

<style scoped>
.text-white {
  color: white;
}
.gradient-blue {
  background: linear-gradient(to right, #2196F3, #64B5F6);
  color: white;
}
.gradient-orange {
  background: linear-gradient(to right, #FF9800, #FFB74D);
  color: white;
}
.gradient-pink {
  background: linear-gradient(to right, #E91E63, #F06292);
  color: white;
}
.fill-height {
  height: 100%;
}
</style>
