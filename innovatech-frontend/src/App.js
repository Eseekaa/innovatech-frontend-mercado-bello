import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import Recursos from './pages/Recursos';

// Context del tema: permite que cualquier componente sepa si está en modo oscuro
// createContext crea un "canal" global de comunicación entre componentes
// sin necesidad de pasar props manualmente por cada nivel
export const ThemeContext = createContext();

// Hook personalizado para usar el tema fácilmente en cualquier componente
// En vez de escribir useContext(ThemeContext) cada vez, usamos useTheme()
export const useTheme = () => useContext(ThemeContext);

// Componente que protege rutas privadas
// Si no hay token JWT, redirige al login automáticamente
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  // Estado del modo oscuro - false = modo claro, true = modo oscuro
  const [darkMode, setDarkMode] = useState(false);

  // Alterna entre modo claro y oscuro
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    // ThemeContext.Provider: hace que darkMode y toggleDarkMode
    // estén disponibles para TODOS los componentes hijos
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {/* Aplica el fondo global según el tema */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#0f172a' : '#f0f2f5',
        transition: 'all 0.3s ease',
      }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/proyectos" element={<PrivateRoute><Proyectos /></PrivateRoute>} />
            <Route path="/recursos" element={<PrivateRoute><Recursos /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;