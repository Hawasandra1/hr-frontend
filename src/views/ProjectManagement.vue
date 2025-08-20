<template>
  <v-container fluid>

    <v-card class="pa-4 rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Projects</span>
        <v-btn color="primary" @click="openDialog()" prepend-icon="mdi-plus">
          Add New Project
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="projects"
          :loading="loading"
          class="elevation-1"
          item-key="id"
        >
          <template v-slot:item.employee="{ item }">
            {{ item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Unassigned' }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" small>{{ item.status }}</v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="text" color="blue" @click="openDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit Project</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="text" color="red" @click="openDeleteDialog(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete Project</span>
            </v-tooltip>
          </template>
          <template v-slot:no-data>
            <v-alert :value="true" color="info" icon="mdi-information">
              No projects found. Click "Add New Project" to create one.
            </v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Project Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="headline">{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="editableProject.name" label="Project Name" variant="outlined" :rules="[v => !!v || 'Project name is required']"></v-text-field>
            <v-textarea v-model="editableProject.description" label="Description" variant="outlined" rows="3"></v-textarea>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editableProject.startDate" label="Start Date" type="date" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editableProject.endDate" label="End Date" type="date" variant="outlined"></v-text-field>
              </v-col>
            </v-row>
            <v-select v-model="editableProject.status" :items="['Planning', 'In Progress', 'Completed', 'On Hold']" label="Status" variant="outlined"></v-select>
            <v-select v-model="editableProject.employeeId" :items="employees" item-title="fullName" item-value="id" label="Assign to Employee (Optional)" variant="outlined" clearable></v-select>
            <v-alert v-if="formError" type="error" class="mt-2">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="handleSaveProject" :loading="formLoading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
        <v-card>
            <v-card-title class="headline">Confirm Deletion</v-card-title>
            <v-card-text>Are you sure you want to delete this project?</v-card-text>
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
import projectService from '@/services/project.service';
import employeeService from '@/services/employee.service';

const projects = ref([]);
const employees = ref([]);
const loading = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const formLoading = ref(false);
const formError = ref('');
const form = ref(null);
const editableProject = ref({});
const defaultProject = {
  name: '',
  description: '',
  status: 'Planning',
  startDate: null,
  endDate: null,
  employeeId: null,
};

const headers = ref([
  { title: 'Project Name', key: 'name' },
  { title: 'Assigned To', key: 'employee' },
  { title: 'Status', key: 'status' },
  { title: 'Start Date', key: 'startDate' },
  { title: 'End Date', key: 'endDate' },
  { title: 'Actions', key: 'actions', sortable: false },
]);

const formTitle = computed(() => (editableProject.value.id ? 'Edit Project' : 'Add New Project'));

onMounted(async () => {
  await fetchProjects();
  await fetchEmployees();
});

async function fetchProjects() {
  loading.value = true;
  try {
    projects.value = await projectService.getAllProjects();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchEmployees() {
  try {
    const employeeList = await employeeService.getAllEmployees();
    employees.value = employeeList.map(emp => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.lastName}`,
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  }
}

function getStatusColor(status) {
    const colors = {
        'Planning': 'blue',
        'In Progress': 'orange',
        'Completed': 'green',
        'On Hold': 'grey',
    };
    return colors[status] || 'default';
}

function openDialog(item = null) {
  if (item) {
    editableProject.value = { ...item };
  } else {
    editableProject.value = { ...defaultProject };
  }
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  formError.value = '';
}

async function handleSaveProject() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  formLoading.value = true;
  formError.value = '';
  try {
    if (editableProject.value.id) {
      await projectService.updateProject(editableProject.value.id, editableProject.value);
    } else {
      await projectService.createProject(editableProject.value);
    }
    closeDialog();
    await fetchProjects();
  } catch (error) {
    formError.value = 'Failed to save project.';
  } finally {
    formLoading.value = false;
  }
}

function openDeleteDialog(item) {
    editableProject.value = item;
    deleteDialog.value = true;
}

function closeDeleteDialog() {
    deleteDialog.value = false;
}

async function confirmDelete() {
    formLoading.value = true;
    try {
        await projectService.deleteProject(editableProject.value.id);
        closeDeleteDialog();
        await fetchProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
    } finally {
        formLoading.value = false;
    }
}
</script>
