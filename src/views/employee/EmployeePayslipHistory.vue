<template>
  <v-container fluid>
    <h1 class="text-h5 font-weight-bold mb-4">My Payslip History</h1>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>All My Payslips</span>
        <v-btn color="secondary" @click="exportToExcel" prepend-icon="mdi-file-excel">
          Export to Excel
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="myPayslips"
        :loading="loading"
      >
        <template v-slot:item.payPeriod="{ item }">
          {{ formatDate(item.payPeriodStartDate) }} to {{ formatDate(item.payPeriodEndDate) }}
        </template>
        <template v-slot:item.grossPay="{ item }">
          TZS {{ item.grossPay }}
        </template>
        <template v-slot:item.actions="{ item }">
          <!-- THIS IS THE FIX: The route name now correctly points to the employee's page -->
          <v-btn
            color="primary"
            size="small"
            :to="{ name: 'EmployeePayslipDisplay', params: { id: item.id } }"
          >
            View Details
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import payslipService from '@/services/payslip.service';
import * as XLSX from 'xlsx';

const myPayslips = ref([]);
const loading = ref(false);

const headers = [
  { title: 'Payslip ID', key: 'payslipId' },
  { title: 'Pay Period', key: 'payPeriod' },
  { title: 'Gross Pay', key: 'grossPay' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

onMounted(async () => {
  loading.value = true;
  try {
    myPayslips.value = await payslipService.getMyPayslips();
  } catch (error) {
    console.error('Failed to fetch payslip history:', error);
  } finally {
    loading.value = false;
  }
});

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function exportToExcel() {
  if (myPayslips.value.length === 0) return;

  const dataToExport = myPayslips.value.map(p => ({
    'Payslip ID': p.payslipId,
    'Pay Period Start': formatDate(p.payPeriodStartDate),
    'Pay Period End': formatDate(p.payPeriodEndDate),
    'Gross Pay': p.grossPay,
    'Total Deductions': p.deductions,
    'Net Pay': p.netPay,
    'Status': p.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'My Payslips');
  XLSX.writeFile(workbook, 'My_Payslip_History.xlsx');
}
</script>
