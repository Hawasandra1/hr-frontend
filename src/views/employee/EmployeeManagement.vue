<template>
  <v-container fluid class="employee-management-container">
    <v-card class="mb-6 pa-4 rounded-lg">
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
        <span>Employee Records</span>
        <v-btn color="primary" @click="openDialog()" prepend-icon="mdi-plus">
          Add New Employee
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search Employees"
          append-inner-icon="mdi-magnify"
          single-line
          hide-details
          variant="outlined"
          class="mb-4"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="employees"
          :search="search"
          :loading="loadingTable"
          class="elevation-1"
          item-key="id"
        >
          <template v-slot:item.fullName="{ item }">
            {{ item.firstName }} {{ item.lastName }}
          </template>
          <template v-slot:item.department="{ item }">
            {{ item.department ? item.department.name : 'N/A' }}
          </template>
          
          <!-- NEW: Template for the status column -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark small>
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="blue" class="mr-2" @click="openDialog(item)">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Edit Employee</v-tooltip>
            </v-btn>
            <v-btn icon size="small" variant="text" color="red" @click="confirmDelete(item)">
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Delete Employee</v-tooltip>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert :value="true" color="info" icon="mdi-information">
              No employees found. Click "Add New Employee" to get started.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="headline">{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="employeeForm" @submit.prevent="saveEmployee">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.firstName" label="First Name" variant="outlined" :rules="[v => !!v || 'First Name is required']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.lastName" label="Last Name" variant="outlined" :rules="[v => !!v || 'Last Name is required']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.employeeId" label="Employee ID" variant="outlined" :rules="[v => !!v || 'Employee ID is required']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.email" label="Email" type="email" variant="outlined" :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.position" label="Position" variant="outlined" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="editedEmployee.departmentId" :items="departments" item-title="name" item-value="id" label="Department" variant="outlined" :rules="[v => !!v || 'Department is required']" required></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.hireDate" label="Hire Date" type="date" variant="outlined" :rules="[v => !!v || 'Hire Date is required']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedEmployee.contactNumber" label="Contact Number" variant="outlined"></v-text-field>
              </v-col>
              
              <!-- NEW: Status selection field -->
              <v-col cols="12" sm="6">
                  <v-select v-model="editedEmployee.status" :items="['active', 'on leave', 'inactive']" label="Status" variant="outlined" :rules="[v => !!v || 'Status is required']" required></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="editedEmployee.password" label="Password" :type="isNewEmployee ? 'text' : 'password'" variant="outlined" :placeholder="isNewEmployee ? 'Set initial password' : 'Leave blank to keep unchanged'" :rules="isNewEmployee ? [v => !!v || 'Password is required'] : []" :required="isNewEmployee" hint="Set an initial password for a new employee."></v-text-field>
              </v-col>
            </v-row>
            <v-alert v-if="formError" type="error" closable class="mt-4">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="elevated" @click="saveEmployee" :loading="loadingForm">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete this employee record?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="red-darken-1" variant="elevated" @click="deleteEmployeeConfirm" :loading="loadingDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import EmployeeService from '@/services/employee.service';
import DepartmentService from '@/services/department.service';

const employees = ref([]);
const departments = ref([]);
const search = ref('');
const loadingTable = ref(false);
const loadingForm = ref(false);
const loadingDelete = ref(false);

const dialog = ref(false);
const deleteDialog = ref(false);
const editedIndex = ref(-1);

const editedEmployee = ref({
  id: null,
  firstName: '',
  lastName: '',
  employeeId: '',
  email: '',
  password: '',
  position: '',
  departmentId: null,
  hireDate: '',
  contactNumber: '',
  status: 'active', // Added status
});
const defaultEmployee = {
  id: null,
  firstName: '',
  lastName: '',
  employeeId: '',
  email: '',
  password: '',
  position: '',
  departmentId: null,
  hireDate: '',
  contactNumber: '',
  status: 'active', // Added status
};

const employeeForm = ref(null);
const formError = ref('');

const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

const headers = [
  { title: 'Employee ID', key: 'employeeId' },
  { title: 'Name', key: 'fullName' },
  { title: 'Email', key: 'email' },
  { title: 'Position', key: 'position' },
  { title: 'Department', key: 'department' },
  { title: 'Status', key: 'status' }, // Added status column
  { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Add New Employee' : 'Edit Employee';
});

const isNewEmployee = computed(() => editedIndex.value === -1);

onMounted(async () => {
  await fetchEmployees();
  await fetchDepartments();
});

async function fetchEmployees() {
  loadingTable.value = true;
  try {
    const data = await EmployeeService.getAllEmployees();
    employees.value = data;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    showSnackbar('Failed to load employees.', 'error');
  } finally {
    loadingTable.value = false;
  }
}

async function fetchDepartments() {
  try {
    const data = await DepartmentService.getAllDepartments();
    departments.value = data;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    showSnackbar('Failed to load departments.', 'error');
  }
}

// --- NEW: Method to determine chip color based on status ---
function getStatusColor(status) {
    if (status === 'active') return 'green';
    if (status === 'on leave') return 'orange';
    return 'grey'; // Fallback for other statuses
}

async function openDialog(item = null) {
  formError.value = '';
  if (item) {
    editedIndex.value = employees.value.indexOf(item);
    editedEmployee.value = { ...item, password: '' };
    if (item.department && item.department.id) {
      editedEmployee.value.departmentId = item.department.id;
    } else {
      editedEmployee.value.departmentId = null;
    }
  } else {
    editedIndex.value = -1;
    editedEmployee.value = { ...defaultEmployee };
  }
  dialog.value = true;
  await nextTick();
  employeeForm.value?.resetValidation();
}

function closeDialog() {
  dialog.value = false;
  loadingForm.value = false;
  formError.value = '';
  editedEmployee.value = { ...defaultEmployee };
  editedIndex.value = -1;
}

async function saveEmployee() {
  const { valid } = await employeeForm.value.validate();
  if (!valid) {
    formError.value = 'Please correct the errors in the form.';
    return;
  }

  loadingForm.value = true;
  formError.value = '';

  const employeeDataToSend = { ...editedEmployee.value };
  
  if (!isNewEmployee.value && !employeeDataToSend.password) {
    delete employeeDataToSend.password;
  }

  if (isNewEmployee.value) {
    delete employeeDataToSend.id;
  }

  try {
    if (!isNewEmployee.value) {
      await EmployeeService.updateEmployee(editedEmployee.value.id, employeeDataToSend);
      showSnackbar('Employee updated successfully!', 'success');
    } else {
      await EmployeeService.createEmployee(employeeDataToSend);
      showSnackbar('Employee added successfully!', 'success');
    }
    await fetchEmployees();
    closeDialog();
  } catch (error) {
    console.error('Error saving employee:', error);
    formError.value = error.response?.data?.message || 'Failed to save employee.';
    showSnackbar(formError.value, 'error');
  } finally {
    loadingForm.value = false;
  }
}

function confirmDelete(item) {
  editedEmployee.value = { ...item };
  deleteDialog.value = true;
}

function closeDeleteDialog() {
  deleteDialog.value = false;
  loadingDelete.value = false;
  editedEmployee.value = { ...defaultEmployee };
}

async function deleteEmployeeConfirm() {
  loadingDelete.value = true;
  try {
    await EmployeeService.deleteEmployee(editedEmployee.value.id);
    await fetchEmployees();
    showSnackbar('Employee deleted successfully!', 'success');
    closeDeleteDialog();
  } catch (error) {
    console.error('Error deleting employee:', error);
    showSnackbar('Failed to delete employee.', 'error');
  } finally {
    loadingDelete.value = false;
  }
}

function showSnackbar(message, color) {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
}
</script>

<style scoped>
.employee-management-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
