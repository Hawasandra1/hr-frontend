// Import the configured api instance, NOT the raw axios library.
import api from './api';

class DashboardService {
  // The getAuthHeader() function is no longer needed because the
  // api.js interceptor handles the token automatically.

  async getEmployeesOverview() {
    try {
      // Use the configured 'api' instance. It already knows the base URL.
      // No need to manually add headers.
      const response = await api.get('/dashboard/employees-overview');
      return response.data;
    } catch (error) {
      console.error("Error fetching employees overview:", error.response?.data || error);
      throw error;
    }
  }

  async getDepartmentEmployeeDistribution() {
    try {
      const response = await api.get('/dashboard/employee-distribution-by-department');
      return response.data;
    } catch (error) {
      console.error("Error fetching department employee distribution:", error.response?.data || error);
      throw error;
    }
  }

  async getLeaveStatusBreakdown() {
    try {
      const response = await api.get('/dashboard/leave-status-breakdown');
      return response.data;
    } catch (error) {
      console.error("Error fetching leave status breakdown:", error.response?.data || error);
      throw error;
    }
  }
}

export default new DashboardService();
