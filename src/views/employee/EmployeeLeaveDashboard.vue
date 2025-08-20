<template>
  <v-container fluid>
    <h1 class="text-h5 font-weight-bold mb-4">My Leave Requests</h1>
    <v-row>
      <!-- Leave Request Form -->
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <v-card-title>Request New Leave</v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitLeaveRequest">
              <v-text-field v-model="newLeave.leaveType" label="Leave Type (e.g., Vacation, Sick)" variant="outlined" :rules="[v => !!v || 'Type is required']"></v-text-field>
              <v-text-field v-model="newLeave.startDate" label="Start Date" type="date" variant="outlined" :rules="[v => !!v || 'Start date is required']"></v-text-field>
              <v-text-field v-model="newLeave.endDate" label="End Date" type="date" variant="outlined" :rules="[v => !!v || 'End date is required']"></v-text-field>
              <v-textarea v-model="newLeave.reason" label="Reason" variant="outlined" rows="3"></v-textarea>
              <v-btn type="submit" color="primary" block :loading="formLoading">Submit Request</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- Leave History Table -->
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title>My Leave History</v-card-title>
          <v-data-table :headers="headers" :items="myLeaves" :loading="tableLoading">
            <!-- THIS IS THE FIX: Added the v-chip for status display -->
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import leaveService from '@/services/leave.service';

const myLeaves = ref([]);
const newLeave = ref({ leaveType: '', startDate: '', endDate: '', reason: '' });
const tableLoading = ref(false);
const formLoading = ref(false);
const form = ref(null);
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Leave Type', key: 'leaveType' },
  { title: 'Start Date', key: 'startDate' },
  { title: 'End Date', key: 'endDate' },
  { title: 'Status', key: 'status' },
  { title: 'Reason', key: 'reason' },
];

onMounted(fetchMyLeaves);

async function fetchMyLeaves() {
  tableLoading.value = true;
  try {
    myLeaves.value = await leaveService.getMyLeaveRequests();
  } catch (error) {
    showSnackbar('Failed to fetch leave history.', 'error');
  } finally {
    tableLoading.value = false;
  }
}

async function submitLeaveRequest() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  formLoading.value = true;
  try {
    await leaveService.requestLeave(newLeave.value);
    showSnackbar('Leave request submitted successfully!', 'success');
    form.value.reset();
    await fetchMyLeaves(); // Refresh the history table
  } catch (error) {
    showSnackbar(error.response?.data?.message || 'Failed to submit request.', 'error');
  } finally {
    formLoading.value = false;
  }
}

// THIS IS THE FIX: Added the color helper function
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
