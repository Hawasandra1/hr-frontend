<template>
  <v-container>
    <v-btn @click="$router.back()" color="grey" class="mb-4" prepend-icon="mdi-arrow-left">
      Back
    </v-btn>

    <v-card v-if="loading" class="pa-5 text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-4">Loading Payslip...</p>
    </v-card>

    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <div v-if="payslip">
      <v-card id="payslip-content" class="pa-8 mb-4">
        <!-- Header -->
        <v-row align="center" class="mb-6">
          <v-col cols="8">
            <h1 class="text-h4 font-weight-bold text-primary">Payslip</h1>
            <p class="text-subtitle-1">Your Company Inc.</p>
          </v-col>
          <v-col cols="4" class="text-right">
            <p><strong>Payslip ID:</strong> {{ payslip.payslipId }}</p>
            <p><strong>Pay Period:</strong> {{ payslip.payPeriodStartDate }} to {{ payslip.payPeriodEndDate }}</p>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Employee Details -->
        <v-row>
          <v-col cols="12">
            <h2 class="text-h6 mb-2">Employee Details</h2>
            <p><strong>Name:</strong> {{ payslip.employee.firstName }} {{ payslip.employee.lastName }}</p>
            <p><strong>Position:</strong> {{ payslip.employee.position }}</p>
            <p><strong>Email:</strong> {{ payslip.employee.email }}</p>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Earnings & Deductions -->
        <v-row>
          <v-col cols="12" md="6">
            <h2 class="text-h6 mb-2">Earnings</h2>
            <v-table>
              <tbody>
                <tr>
                  <td>Gross Pay ({{ payslip.employeeType }})</td>
                  <td class="text-right font-weight-bold">{{ currencySymbol }}{{ payslip.grossPay }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
          <v-col cols="12" md="6">
            <h2 class="text-h6 mb-2">Deductions</h2>
            <v-table>
              <tbody>
                <tr>
                  <td>PAYE (8.8%)</td>
                  <td class="text-right">{{ currencySymbol }}{{ payslip.paye }}</td>
                </tr>
                <tr>
                  <td>NSSF (10%)</td>
                  <td class="text-right">{{ currencySymbol }}{{ payslip.nssf }}</td>
                </tr>
                 <tr v-if="payslip.otherDeductions > 0">
                  <td>Other Deductions</td>
                  <td class="text-right">{{ currencySymbol }}{{ payslip.otherDeductions }}</td>
                </tr>
                <tr class="font-weight-bold">
                  <td>Total Deductions</td>
                  <td class="text-right">{{ currencySymbol }}{{ payslip.deductions }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Summary -->
        <v-row justify="end" class="mt-4">
          <v-col cols="12" md="5">
            <v-card variant="outlined" class="pa-4">
              <v-row>
                <v-col><strong>Gross Pay:</strong></v-col>
                <v-col class="text-right">{{ currencySymbol }}{{ payslip.grossPay }}</v-col>
              </v-row>
              <v-row>
                <v-col><strong>Total Deductions:</strong></v-col>
                <v-col class="text-right">-{{ currencySymbol }}{{ payslip.deductions }}</v-col>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <v-row class="font-weight-bold text-h6">
                <v-col>Net Pay:</v-col>
                <v-col class="text-right text-success">{{ currencySymbol }}{{ payslip.netPay }}</v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Notes -->
        <v-row v-if="payslip.notes" class="mt-6">
            <v-col>
                <h2 class="text-h6 mb-2">Notes</h2>
                <p>{{ payslip.notes }}</p>
            </v-col>
        </v-row>

        <!-- UPDATED: Signature Section is now conditional -->
        <v-row v-if="currentUser && currentUser.role !== 'Employee'" class="mt-8 pt-8">
          <v-col cols="6" offset="6" class="text-right">
            <p class="mb-10">{{ currentUser.username }}</p>
            <p class="mb-0">............................................................</p>
            <p>{{ currentUser.role }}'s Signature</p>
          </v-col>
        </v-row>

      </v-card>

      <!-- Action Buttons -->
      <v-card class="pa-4">
        <v-card-title>Download Options</v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="downloadPDF" prepend-icon="mdi-file-pdf-box">Download as PDF</v-btn>
          <v-btn color="blue" @click="downloadImage('jpeg')" prepend-icon="mdi-file-image">Download as JPG</v-btn>
          <v-btn color="green" @click="downloadImage('png')" prepend-icon="mdi-file-image">Download as PNG</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import payslipService from '@/services/payslip.service';
import AuthService from '@/services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const route = useRoute();
const payslip = ref(null);
const loading = ref(false);
const error = ref('');
const currencySymbol = ref('TZS ');
const currentUser = ref(null);

onMounted(async () => {
  currentUser.value = AuthService.getCurrentUser();

  const payslipId = route.params.id;
  if (payslipId) {
    loading.value = true;
    try {
      payslip.value = await payslipService.getPayslipById(payslipId);
    } catch (err) {
      console.error(err);
      error.value = 'Failed to load payslip details. It may have been deleted.';
    } finally {
      loading.value = false;
    }
  }
});

const downloadImage = async (format) => {
  const payslipElement = document.getElementById('payslip-content');
  if (!payslipElement) return;
  const canvas = await html2canvas(payslipElement, { scale: 2 });
  const image = canvas.toDataURL(`image/${format}`, 1.0);
  const link = document.createElement('a');
  link.href = image;
  link.download = `payslip-${payslip.value.payslipId}.${format}`;
  link.click();
};

const downloadPDF = async () => {
  const payslipElement = document.getElementById('payslip-content');
  if (!payslipElement) return;

  const canvas = await html2canvas(payslipElement, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  const now = new Date();
  const timestamp = `Downloaded on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString()}`;
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(timestamp, 10, pdf.internal.pageSize.getHeight() - 7);
  
  pdf.save(`payslip-${payslip.value.payslipId}.pdf`);
};
</script>
