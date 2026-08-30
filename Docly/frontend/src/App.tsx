import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FindDoctorsPage from './pages/FindDoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import PrescriptionViewPage from './pages/PrescriptionViewPage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import RequireRole from './components/auth/RequireRole';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HelpCenterPage from './pages/HelpCenterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactUsPage from './pages/ContactUsPage';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/doctors" element={<FindDoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
          <Route path="/appointments" element={<RequireRole allowed={['patient', 'doctor']} />}>
            <Route index element={<MyAppointmentsPage />} />
          </Route>
          <Route path="/appointments/:appointmentId" element={<RequireRole allowed={['patient', 'doctor', 'admin']} />}>
            <Route index element={<AppointmentDetailsPage />} />
          </Route>
          <Route path="/records" element={<RequireRole allowed={['patient', 'admin']} />}>
            <Route index element={<PatientRecordsPage />} />
          </Route>
          <Route path="/prescriptions/:id" element={<RequireRole allowed={['patient', 'doctor', 'admin']} />}>
            <Route index element={<PrescriptionViewPage />} />
          </Route>
          <Route path="/video/:appointmentId" element={<RequireRole allowed={['patient', 'doctor']} />}>
            <Route index element={<VideoConsultationPage />} />
          </Route>
          <Route path="/doctor" element={<RequireRole allowed="doctor" />}>
            <Route index element={<DoctorDashboardPage />} />
          </Route>
          <Route path="/admin" element={<RequireRole allowed="admin" />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/contact" element={<ContactUsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
