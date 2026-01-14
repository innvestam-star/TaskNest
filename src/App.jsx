import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Auth from './pages/auth/Auth';
import Dashboard from './pages/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          {/* Add more protected routes here */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
