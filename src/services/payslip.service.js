import api from './api';

class PayslipService {
  async generatePayslip(payslipData) {
    try {
      const response = await api.post('/payslips/generate', payslipData);
      return response.data;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }

  async getAllPayslips() {
    try {
      const response = await api.get('/payslips');
      return response.data;
    } catch (error) {
      console.error('Error fetching payslips:', error);
      throw error;
    }
  }

  // --- NEW METHOD for employees ---
  async getMyPayslips() {
    try {
      const response = await api.get('/payslips/my-payslips');
      return response.data;
    } catch (error) {
      console.error('Error fetching your payslips:', error);
      throw error;
    }
  }

  async getPayslipById(id) {
    try {
      const response = await api.get(`/payslips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payslip with ID ${id}:`, error);
      throw error;
    }
  }

  async updatePayslip(id, payslipData) {
    try {
      const response = await api.put(`/payslips/${id}`, payslipData);
      return response.data;
    } catch (error) {
      console.error(`Error updating payslip with ID ${id}:`, error);
      throw error;
    }
  }

  async deletePayslip(id) {
    try {
      const response = await api.delete(`/payslips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting payslip with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new PayslipService();
