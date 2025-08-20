import api from './api'; // Assuming you have an api.js that sets up axios with base URL and interceptors

class EmployeeService {
  /**
   * Fetches all employee records.
   * @returns {Promise<Array>} A list of employee objects.
   */
  
  async getAllEmployees() {
    try {
      const response = await api.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching all employees:', error);
      throw error;
    }
  }

  /**
   * Fetches a single employee record by ID.
   * @param {string} id The ID of the employee.
   * @returns {Promise<Object>} The employee object.
   */
  async getEmployeeById(id) {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new employee record.
   * @param {Object} employeeData The data for the new employee.
   * @returns {Promise<Object>} The created employee object.
   */
  async createEmployee(employeeData) {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Updates an existing employee record.
   * @param {string} id The ID of the employee to update.
   * @param {Object} employeeData The updated data for the employee.
   * @returns {Promise<Object>} The updated employee object.
   */
  async updateEmployee(id, employeeData) {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes an employee record.
   * @param {string} id The ID of the employee to delete.
   * @returns {Promise<Object>} A confirmation message or deleted object.
   */
  async deleteEmployee(id) {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      throw error;
    }
  }

  // --- NEW METHODS for Profile Settings ---

  /**
   * Changes the password for the currently logged-in employee.
   * @param {Object} passwords The old and new passwords.
   * @returns {Promise<Object>} A confirmation message.
   */
  async changePassword(passwords) {
    try {
      const response = await api.put('/employees/my-profile/change-password', passwords);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Uploads a profile picture for the currently logged-in employee.
   * @param {FormData} formData The form data containing the image file.
   * @returns {Promise<Object>} The response containing the new image URL.
   */
  async uploadProfilePicture(formData) {
    try {
      const response = await api.post('/employees/my-profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}

export default new EmployeeService();
