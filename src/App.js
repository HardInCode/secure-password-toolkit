import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PasswordSecurityApp from './components/PasswordSecurityApp';

// Get the basename from package.json homepage or use root
const getBasename = () => {
  const { homepage } = require('../package.json');
  return homepage ? new URL(homepage).pathname : '/';
};

function App() {
  return (
    <Router basename={getBasename()}>
      <Routes>
        <Route path="/" element={<PasswordSecurityApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 