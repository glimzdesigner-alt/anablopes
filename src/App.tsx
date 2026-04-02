import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminModels from './pages/AdminModels';
import AdminPromotions from './pages/AdminPromotions';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="models" element={<AdminModels />} />
          <Route path="promotions" element={<AdminPromotions />} />
        </Route>
      </Routes>
    </Router>
  );
}
