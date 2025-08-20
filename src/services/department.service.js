// frontend/src/services/department.service.js
import api from './api'; // Assuming you have an api.js

class DepartmentService {
    /**
     * Fetches all department records.
     * @returns {Promise<Array>} A list of department objects.
     */
    async getAllDepartments() {
        try {
            const response = await api.get('/departments');
            return response.data;
        } catch (error) {
            console.error('Error fetching all departments:', error);
            throw error; // Re-throw to be handled by the component
        }
    }

    /**
     * Fetches a single department by ID.
     * @param {number} id - The ID of the department.
     * @returns {Promise<Object>} The department object.
     */
    async getDepartmentById(id) {
        try {
            const response = await api.get(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching department with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new department record.
     * @param {Object} departmentData - The data for the new department (e.g., { name: '...', description: '...' }).
     * @returns {Promise<Object>} The newly created department object from the API.
     */
    async createDepartment(departmentData) {
        try {
            const response = await api.post('/departments', departmentData);
            return response.data; // Returns the newly created department object
        } catch (error) {
            console.error('Error creating department:', error);
            throw error;
        }
    }

    /**
     * Updates an existing department record.
     * @param {number} id - The ID of the department to update.
     * @param {Object} departmentData - The updated data for the department.
     * @returns {Promise<Object>} The updated department object from the API.
     */
    async updateDepartment(id, departmentData) {
        try {
            const response = await api.put(`/departments/${id}`, departmentData);
            return response.data; // Returns the updated department object
        } catch (error) {
            console.error(`Error updating department with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a department record by ID.
     * @param {number} id - The ID of the department to delete.
     * @returns {Promise<Object>} A confirmation response from the API.
     */
    async deleteDepartment(id) {
        try {
            const response = await api.delete(`/departments/${id}`);
            return response.data; // Returns success message or confirmation
        } catch (error) {
            console.error(`Error deleting department with ID ${id}:`, error);
            throw error;
        }
    }
}

export default new DepartmentService();