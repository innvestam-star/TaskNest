import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { RBACProvider } from './context/RBACContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Schedule from './pages/Schedule';
import Calendar from './pages/Calendar';
import NestAI from './pages/NestAI';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import BookingSetup from './pages/BookingSetup';
import PublicBooking from './pages/PublicBooking';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Invoices from './pages/Invoices';
import CreateDocument from './pages/CreateDocument';
import DocumentView from './pages/DocumentView';
import InvoiceDashboard from './pages/InvoiceDashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Payments from './pages/Payments';
import BillingReports from './pages/BillingReports';
import CashFlow from './pages/CashFlow';
import FinancialReports from './pages/FinancialReports';
import Marketing from './pages/Marketing';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <RBACProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />

                {/* Public Booking Routes - No Sidebar */}
                <Route path="/book/:userSlug" element={<PublicBooking />} />

                {/* Authenticated Routes - Wrapped in Layout */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<MyTasks />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/ai-assistant" element={<NestAI />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancelled" element={<PaymentCancelled />} />
                  <Route path="/booking/setup" element={<BookingSetup />} />
                  <Route path="/marketing" element={<AdminRoute><Marketing /></AdminRoute>} />

                  {/* Project Management Routes */}
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />

                  {/* Invoices & Quotes Routes (Legacy) */}
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/new" element={<CreateDocument />} />
                  <Route path="/invoices/edit/:id" element={<CreateDocument />} />
                  <Route path="/invoices/:id" element={<DocumentView />} />

                  {/* Billing Module Routes */}
                  <Route path="/billing" element={<InvoiceDashboard />} />
                  <Route path="/billing/quotes" element={<Invoices type="quote" />} />
                  <Route path="/billing/quotes/new" element={<CreateDocument type="quote" />} />
                  <Route path="/billing/invoices" element={<Invoices type="invoice" />} />
                  <Route path="/billing/invoices/new" element={<CreateDocument type="invoice" />} />
                  <Route path="/billing/clients" element={<Clients />} />
                  <Route path="/billing/products" element={<Products />} />
                  <Route path="/billing/payments" element={<Payments />} />
                  <Route path="/billing/cashflow" element={<CashFlow />} />
                  <Route path="/billing/reports" element={<BillingReports />} />
                  <Route path="/billing/financial-reports" element={<FinancialReports />} />
                </Route>
              </Routes>
            </RBACProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
