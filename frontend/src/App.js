import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForms from './components/AuthForms';
function App() {
  return (
    <Router>
      <Routes>
        {/* Define the route for AuthForms */}
        <Route path="/" element={<AuthForms />} />
      </Routes>
    </Router>
  );
}

export default App;
