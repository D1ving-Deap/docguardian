import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Index from './routes/Index';
import Login from './routes/Login';
import ResetPassword from './routes/ResetPassword';
import VerifyEmail from './routes/VerifyEmail';
import Dashboard from './routes/Dashboard';
import NotFound from './routes/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OCRTestPage from './routes/OCRTestPage';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/ocr-test" element={<OCRTestPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
