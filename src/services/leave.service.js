import api from './api';

class LeaveService {
  // For employees to request leave
  async requestLeave(leaveData) {
    return api.post('/leaves/request', leaveData).then(response => response.data);
  }

  // For employees to get their own leave history
  async getMyLeaveRequests() {
    return api.get('/leaves/my-leaves').then(response => response.data);
  }

  // For admins/HR to get all leave requests
  async getAllLeaveRequests() {
    return api.get('/leaves').then(response => response.data);
  }

  // For admins/HR to approve or reject a request
  async updateLeaveStatus(id, status) {
    return api.put(`/leaves/${id}/status`, { status }).then(response => response.data);
  }
}

export default new LeaveService();
