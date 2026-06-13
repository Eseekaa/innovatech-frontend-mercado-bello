import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiFolder,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useTheme } from '../App';
import './Navbar.css';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/proyectos', label: 'Proyectos', icon: FiFolder },
  { path: '/recursos', label: 'Recursos', icon: FiUsers },
  { path: '/tareas', label: 'Tareas', icon: FiCheckSquare },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const username = localStorage.getItem('username') || 'Usuario';
  const rol = localStorage.getItem('rol') || 'USUARIO';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  const roleLabel = rol === 'ADMIN'
    ? 'Administrador'
    : rol === 'JEFE_PROYECTO'
      ? 'Jefe de Proyecto'
      : 'Usuario';

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/dashboard" className="topbar__brand" aria-label="Ir al dashboard">
          <span className="topbar__brand-mark"><FiLayers size={21} /></span>
          <span className="topbar__brand-copy">
            <strong>Innovatech</strong>
            <small>Gestión de proyectos</small>
          </span>
        </Link>

        <button
          type="button"
          className="topbar__menu-button"
          onClick={() => setMenuOpen(open => !open)}
          aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <div className={`topbar__content ${menuOpen ? 'topbar__content--open' : ''}`}>
          <nav className="topbar__nav" aria-label="Navegación principal">
            {navigation.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`topbar__link ${location.pathname === path ? 'topbar__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="topbar__actions">
            <button
              type="button"
              className="topbar__icon-button"
              onClick={toggleDarkMode}
              title={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
              aria-label={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <div className="topbar__user">
              <span className="topbar__avatar" aria-hidden="true">
                {username.charAt(0).toUpperCase()}
              </span>
              <span className="topbar__user-copy">
                <strong>{username}</strong>
                <small>{roleLabel}</small>
              </span>
            </div>

            <button type="button" className="topbar__logout" onClick={handleLogout}>
              <FiLogOut size={17} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
