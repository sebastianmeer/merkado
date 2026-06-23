import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { marketNav } from './data';
import { AdminPage } from './pages/Admin';
import { LoginPage } from './pages/Login';
import { ProfilePage } from './pages/Profile';
import { ProductsPage } from './pages/Products';
import { ResetPasswordPage } from './pages/ResetPassword';
import { SignupPage } from './pages/Signup';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        element={
          <AppShell
            title="Commerce workspace"
            subtitle="Structured screens for browsing, operations, and account management."
            nav={marketNav}
          />
        }
      >
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
