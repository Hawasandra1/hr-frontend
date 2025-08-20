<template>
  <v-container fluid>
    <h1 class="text-h4 font-weight-bold mb-6">Leave Management</h1>

    <v-card class="pa-4 rounded-lg">
      <v-card-title class="text-h6 font-weight-bold">All Employee Leave Requests</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="allLeaves"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.employeeName="{ item }">
            {{ item.employee.firstName }} {{ item.employee.lastName }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <div v-if="item.status && item.status.toLowerCase() === 'pending'">
              <!-- UPDATED: Approve button is now an icon -->
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-check" variant="text" color="green" size="small" class="mr-2" @click="updateStatus(item.id, 'Approved')"></v-btn>
                </template>
                <span>Approve</span>
              </v-tooltip>
              
              <!-- UPDATED: Reject button is now an icon -->
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-close" variant="text" color="red" size="small" @click="updateStatus(item.id, 'Rejected')"></v-btn>
                </template>
                <span>Reject</span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import leaveService from '@/services/leave.service';

const allLeaves = ref([]);
const loading = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Employee Name', key: 'employeeName' },
  { title: 'Leave Type', key: 'leaveType' },
  { title: 'Start Date', key: 'startDate' },
  { title: 'End Date', key: 'endDate' },
  { title: 'Reason', key: 'reason' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

onMounted(fetchAllLeaves);

async function fetchAllLeaves() {
  loading.value = true;
  try {
    allLeaves.value = await leaveService.getAllLeaveRequests();
  } catch (error) {
    showSnackbar('Failed to fetch leave requests.', 'error');
  } finally {
    loading.value = false;
  }
}

async function updateStatus(id, status) {
  try {
    await leaveService.updateLeaveStatus(id, status);
    showSnackbar(`Leave request has been ${status.toLowerCase()}.`, 'success');
    await fetchAllLeaves(); // Refresh the table
  } catch (error) {
    showSnackbar('Failed to update status.', 'error');
  }
}

function getStatusColor(status) {
  if (!status) return 'grey';
  const lowerStatus = status.toLowerCase();
  const colors = { 'pending': 'orange', 'approved': 'green', 'rejected': 'red' };
  return colors[lowerStatus] || 'grey';
}

function showSnackbar(message, color) {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
}
</script>
