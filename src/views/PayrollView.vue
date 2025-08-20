<template>
  <v-container fluid>
    <h1 class="text-h4 font-weight-bold mb-6">Payroll Management</h1>

    <v-card class="pa-4 rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Payslip Status Summary</span>
        <div>
          <v-btn color="primary" class="mr-2" @click="openDialog()" prepend-icon="mdi-plus">
            Generate Payslip
          </v-btn>
          <v-btn color="secondary" @click="exportToExcel" prepend-icon="mdi-file-excel">
            Export to Excel
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedEmployee"
          :items="employees"
          item-title="fullName"
          item-value="id"
          label="Filter by Employee"
          variant="outlined"
          clearable
          class="mb-4"
          style="max-width: 400px;"
        ></v-select>
        
        <v-data-table
          :headers="headers"
          :items="filteredPayslips"
          :loading="loading"
          class="elevation-1"
          item-key="id"
        >
          <template v-slot:item.employeeName="{ item }">
            {{ item.employee?.firstName }} {{ item.employee?.lastName }}
          </template>
          <template v-slot:item.payPeriod="{ item }">
            {{ formatDate(item.payPeriodStartDate) }} to {{ formatDate(item.payPeriodEndDate) }}
          </template>
          <template v-slot:item.grossPay="{ item }">
            {{ currencySymbol }}{{ item.grossPay }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="text" color="primary" :to="{ name: 'PayslipDisplay', params: { id: item.id } }">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>View Payslip</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="text" color="blue" @click="openDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit Payslip</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="text" color="red" @click="openDeleteDialog(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete Payslip</span>
            </v-tooltip>
          </template>
          <template v-slot:no-data>
            <v-alert :value="true" color="info" icon="mdi-information">
              No payslips found for the selected criteria.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Generate/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="headline">{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-select v-model="editablePayslip.employeeId" :items="employees" item-title="fullName" item-value="id" label="Select Employee" variant="outlined" :rules="[v => !!v || 'Employee is required']"></v-select>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editablePayslip.payPeriodStartDate" label="Pay Period Start Date" type="date" variant="outlined" :rules="[v => !!v || 'Start date is required']"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editablePayslip.payPeriodEndDate" label="Pay Period End Date" type="date" variant="outlined" :rules="[v => !!v || 'End date is required']"></v-text-field>
              </v-col>
            </v-row>
            <v-select v-model="editablePayslip.employeeType" :items="['Hourly', 'Salaried', 'Commission']" label="Employee Type" variant="outlined" :rules="[v => !!v || 'Employee type is required']"></v-select>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model.number="editablePayslip.grossPay" label="Gross Pay" type="number" :prefix="currencySymbol" variant="outlined" :rules="[v => v > 0 || 'Gross pay must be positive']"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model.number="editablePayslip.deductions" label="Other Deductions" type="number" :prefix="currencySymbol" variant="outlined"></v-text-field>
              </v-col>
            </v-row>
            <v-textarea v-model="editablePayslip.notes" label="Notes (Optional)" variant="outlined" rows="2"></v-textarea>
            <v-alert v-if="formError" type="error" class="mb-4">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="elevated" @click="handleSavePayslip" :loading="formLoading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
        <v-card>
            <v-card-title class="headline">Confirm Deletion</v-card-title>
            <v-card-text>Are you sure you want to delete this payslip? This action cannot be undone.</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" @click="closeDeleteDialog">Cancel</v-btn>
                <v-btn color="red" @click="confirmDelete" :loading="formLoading">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as XLSX from 'xlsx';
import payslipService from '@/services/payslip.service';
import employeeService from '@/services/employee.service';

const currencySymbol = ref('TZS ');
const payslips = ref([]);
const employees = ref([]);
const loading = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const formLoading = ref(false);
const formError = ref('');
const form = ref(null);
const editablePayslip = ref({});
const defaultPayslip = {
  employeeId: null,
  payPeriodStartDate: '',
  payPeriodEndDate: '',
  employeeType: '',
  grossPay: 0,
  deductions: 0,
  notes: '',
};

const selectedEmployee = ref(null);

const filteredPayslips = computed(() => {
  if (!selectedEmployee.value) {
    return payslips.value;
  }
  return payslips.value.filter(p => p.employeeId === selectedEmployee.value);
});

const headers = ref([
  { title: 'Payslip ID', key: 'payslipId' },
  { title: 'Employee Name', key: 'employeeName' },
  { title: 'Pay Period', key: 'payPeriod' },
  { title: 'Gross Pay', key: 'grossPay' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]);

const formTitle = computed(() => (editablePayslip.value.id ? 'Edit Payslip' : 'Generate New Payslip'));

onMounted(async () => {
  await fetchPayslips();
  await fetchEmployees();
});

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

async function fetchPayslips() {
  loading.value = true;
  try {
    payslips.value = await payslipService.getAllPayslips();
  } catch (error) {
    console.error('Failed to fetch payslips:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchEmployees() {
  try {
    const employeeList = await employeeService.getAllEmployees();
    employees.value = employeeList.map(emp => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.lastName} (ID: ${emp.employeeId || emp.id})`
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  }
}

function openDialog(item = null) {
  if (item) {
    editablePayslip.value = { ...item };
  } else {
    editablePayslip.value = { ...defaultPayslip };
  }
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  formError.value = '';
  editablePayslip.value = {};
}

async function handleSavePayslip() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  formLoading.value = true;
  formError.value = '';
  try {
    if (editablePayslip.value.id) {
      await payslipService.updatePayslip(editablePayslip.value.id, editablePayslip.value);
    } else {
      await payslipService.generatePayslip(editablePayslip.value);
    }
    closeDialog();
    await fetchPayslips();
  } catch (error) {
    formError.value = error.response?.data?.message || 'Failed to save payslip.';
    console.error('Error saving payslip:', error);
  } finally {
    formLoading.value = false;
  }
}

function openDeleteDialog(item) {
    editablePayslip.value = item;
    deleteDialog.value = true;
}

function closeDeleteDialog() {
    deleteDialog.value = false;
    editablePayslip.value = {};
}

async function confirmDelete() {
    formLoading.value = true;
    try {
        await payslipService.deletePayslip(editablePayslip.value.id);
        closeDeleteDialog();
        await fetchPayslips();
    } catch (error) {
        console.error('Error deleting payslip:', error);
    } finally {
        formLoading.value = false;
    }
}

function exportToExcel() {
  if (filteredPayslips.value.length === 0) return;
  const dataToExport = filteredPayslips.value.map(p => ({
    'Payslip ID': p.payslipId,
    'Employee Name': `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`,
    'Pay Period Start': formatDate(p.payPeriodStartDate),
    'Pay Period End': formatDate(p.payPeriodEndDate),
    'Gross Pay': p.grossPay,
    'Total Deductions': p.deductions,
    'Net Pay': p.netPay,
    'Status': p.status,
    'Generated At': new Date(p.createdAt).toLocaleString(),
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslips');
  XLSX.writeFile(workbook, 'Payslip_Summary.xlsx');
}
</script>
