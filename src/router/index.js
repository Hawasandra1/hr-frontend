import { createRouter, createWebHistory } from 'vue-router';

// --- Import Layouts ---
import AdminLayout from '../layouts/AdminLayout.vue';
import EmployeeLayout from '../layouts/EmployeeLayout.vue';

// --- Import Views ---
import Home from '../views/Home.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import HrDashboard from '../views/dashboards/HrDashboard.vue';
import EmployeeManagement from '../views/employee/EmployeeManagement.vue';
import DepartmentManagement from '../views/DepartmentManagement.vue';
import ProjectManagement from '../views/ProjectManagement.vue';
import PayrollView from '../views/PayrollView.vue';
import LeaveManagement from '../views/LeaveManagement.vue';
import EmployeeLeaveDashboard from '../views/employee/EmployeeLeaveDashboard.vue';
import PayslipDisplay from '../views/payroll/PayslipDisplay.vue';
import AuthService from '../services/auth.service';
import EmployeePayslipHistory from '../views/employee/EmployeePayslipHistory.vue';
import EmployeeProfileSettings from '../views/employee/ProfileSettings.vue';
// --- NEW: Import the Admin Profile Settings component ---
import AdminProfileSettings from '../views/admin/AdminProfileSettings.vue';


const routes = [
  // --- PUBLIC ROUTES ---
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/register', name: 'Register', component: RegisterForm },

  // --- PRIVILEGED USER ROUTES (Admin, HR, Manager) ---
  {
    path: '/app',
    component: AdminLayout,
    meta: { requiresAuth: true, allowedRoles: ['Admin', 'HR', 'Manager'] },
    children: [
      { path: '', redirect: { name: 'HrDashboard' } },
      { path: 'dashboard', name: 'HrDashboard', component: HrDashboard },
      { path: 'employees', name: 'EmployeeManagement', component: EmployeeManagement },
      { path: 'departments', name: 'DepartmentManagement', component: DepartmentManagement },
      { path: 'projects', name: 'ProjectManagement', component: ProjectManagement },
      { path: 'payroll', name: 'Payroll', component: PayrollView },
      { path: 'leave', name: 'LeaveManagement', component: LeaveManagement },
      { path: 'payslip/:id', name: 'PayslipDisplay', component: PayslipDisplay, props: true },
      { 
        path: 'create-user', 
        name: 'CreateUser', 
        component: () => import('../views/admin/CreateUser.vue'),
        meta: { allowedRoles: ['Admin'] }
      },
      // --- NEW: Route for the admin's profile page ---
      {
        path: 'profile',
        name: 'AdminProfile',
        component: AdminProfileSettings
      }
    ]
  },

  // --- EMPLOYEE ROUTES ---
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, allowedRoles: ['Employee'] },
    children: [
      { path: '', redirect: { name: 'EmployeeLeaveDashboard' } },
      { path: 'my-leave', name: 'EmployeeLeaveDashboard', component: EmployeeLeaveDashboard },
      { path: 'my-payslips', name: 'EmployeePayslipHistory', component: EmployeePayslipHistory },
      { 
        path: 'payslip/:id', 
        name: 'EmployeePayslipDisplay', 
        component: PayslipDisplay, 
        props: true 
      },
      {
        path: 'profile',
        name: 'EmployeeProfile',
        component: EmployeeProfileSettings
      }
    ]
  },

  // --- Catch-all for 404 ---
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: { name: 'Home' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const loggedIn = AuthService.getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !loggedIn) {
    return next({ name: 'Login' });
  }

  if (loggedIn) {
    const userRole = loggedIn.role;
    const allowedRoles = to.matched.flatMap(record => record.meta.allowedRoles || []);

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      if (userRole === 'Employee') {
        return next({ name: 'EmployeeLeaveDashboard' });
      } else {
        return next({ name: 'HrDashboard' });
      }
    }
  }

  next();
});

export default router;
