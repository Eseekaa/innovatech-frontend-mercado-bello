import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Proyectos from './pages/Proyectos';
import Recursos from './pages/Recursos';
import Register from './pages/Register';
import Tareas from './pages/Tareas';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem('innovatech-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const darkMode = theme === 'dark';

  // El tema se guarda para que el usuario conserve su preferencia al volver.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('innovatech-theme', theme);
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleDarkMode }}>
      <div className="app-shell">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/proyectos" element={<PrivateRoute><Proyectos /></PrivateRoute>} />
            <Route path="/recursos" element={<PrivateRoute><Recursos /></PrivateRoute>} />
            <Route path="/tareas" element={<PrivateRoute><Tareas /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
