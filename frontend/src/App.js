import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForms from './components/AuthForms';
import { AuthProvider } from './components/AuthContext'; // Import AuthProvider
import Dashboard from './components/Dashboard';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthForms />} />
          <Route path="/student" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;
