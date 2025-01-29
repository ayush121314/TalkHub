import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForms from './components/AuthForms';
import { AuthProvider } from './components/AuthContext'; // Import AuthProvider
import Dashboard from './components/Dashboard';
import LectureDetails from './components/LectureDetails';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthForms />} />
          <Route path="/student" element={<Dashboard />} />
          <Route path="/lecture/:lectureId" element={<LectureDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;
