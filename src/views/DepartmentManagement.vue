<template>
  <v-container fluid>
    <v-row>
      <!-- Department Creation/Edit Form -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-lg fill-height">
          <v-card-title class="text-h6 font-weight-bold">
            {{ isEditMode ? 'Edit Department' : 'Add New Department' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="saveDepartment">
              <v-text-field
                v-model="currentDepartment.name"
                label="Department Name"
                variant="outlined"
                :rules="[v => !!v || 'Name is required']"
                required
                class="mb-4"
              ></v-text-field>
              <v-textarea
                v-model="currentDepartment.description"
                label="Description (Optional)"
                variant="outlined"
                rows="3"
              ></v-textarea>
              <v-alert v-if="formError" type="error" class="mt-2">{{ formError }}</v-alert>
              <v-btn type="submit" color="primary" block :loading="formLoading" size="large">
                {{ isEditMode ? 'Update' : 'Add Department' }}
              </v-btn>
              <v-btn v-if="isEditMode" @click="resetForm" color="grey" block class="mt-2">
                Cancel Edit
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Departments Table -->
      <v-col cols="12" md="8">
        <v-card class="pa-4 rounded-lg fill-height">
          <v-card-title class="text-h6 font-weight-bold">
            All Departments
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="departments"
              :loading="tableLoading"
              class="elevation-1"
              item-key="id"
            >
              <template v-slot:item.createdAt="{ item }">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon variant="text" color="blue" size="small" @click="editDepartment(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon variant="text" color="red" size="small" @click="openDeleteDialog(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </template>
              <template v-slot:no-data>
                <v-alert color="info" icon="mdi-information">No departments found.</v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete the "<strong>{{ departmentToDelete?.name }}</strong>" department?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="red" @click="confirmDelete" :loading="formLoading">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DepartmentService from '@/services/department.service';

const departments = ref([]);
const currentDepartment = ref({
  id: null,
  name: '',
  description: ''
});
const isEditMode = ref(false);
const tableLoading = ref(false);
const formLoading = ref(false);
const formError = ref('');
const deleteDialog = ref(false);
const departmentToDelete = ref(null);
const form = ref(null);
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
];

onMounted(fetchDepartments);

async function fetchDepartments() {
  tableLoading.value = true;
  try {
    departments.value = await DepartmentService.getAllDepartments();
  } catch (err) {
    showSnackbar('Failed to load departments.', 'error');
  } finally {
    tableLoading.value = false;
  }
}

async function saveDepartment() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  formLoading.value = true;
  formError.value = '';
  try {
    const payload = {
      name: currentDepartment.value.name,
      description: currentDepartment.value.description,
    };
    if (isEditMode.value) {
      await DepartmentService.updateDepartment(currentDepartment.value.id, payload);
      showSnackbar('Department updated successfully!', 'success');
    } else {
      await DepartmentService.createDepartment(payload);
      showSnackbar('Department added successfully!', 'success');
    }
    resetForm();
    await fetchDepartments();
  } catch (err) {
    formError.value = err.response?.data?.message || 'Operation failed.';
  } finally {
    formLoading.value = false;
  }
}

function editDepartment(department) {
  currentDepartment.value = { ...department };
  isEditMode.value = true;
}

function resetForm() {
  currentDepartment.value = { id: null, name: '', description: '' };
  isEditMode.value = false;
  form.value.reset();
  form.value.resetValidation();
}

function openDeleteDialog(department) {
  departmentToDelete.value = department;
  deleteDialog.value = true;
}

function closeDeleteDialog() {
  deleteDialog.value = false;
  departmentToDelete.value = null;
}

async function confirmDelete() {
  formLoading.value = true;
  try {
    await DepartmentService.deleteDepartment(departmentToDelete.value.id);
    showSnackbar('Department deleted successfully!', 'success');
    await fetchDepartments();
    closeDeleteDialog();
  } catch (err) {
    showSnackbar('Failed to delete department.', 'error');
  } finally {
    formLoading.value = false;
  }
}

function showSnackbar(message, color) {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
}
</script>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
