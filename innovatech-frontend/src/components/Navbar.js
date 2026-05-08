import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../App';
import { FiSun, FiMoon, FiLogOut, FiGrid, FiFolder, FiUsers } from 'react-icons/fi';

// Navbar profesional con modo oscuro y íconos
// useTheme() obtiene el estado del tema desde el Context global
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme(); // Lee el tema global

  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  // Verifica si el link corresponde a la página actual
  const isActive = (path) => location.pathname === path;

  // Colores que cambian según el tema
  const bg = darkMode
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)';

  return (
    <nav style={{ ...styles.nav, background: bg }}>
      {/* Logo */}
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🏢</span>
        <div>
          <span style={styles.brandText}>Innovatech Solutions</span>
          <span style={styles.brandSub}>Plataforma de Gestión</span>
        </div>
      </div>

      {/* Links de navegación con íconos */}
      <div style={styles.links}>
        <Link to="/dashboard" style={{
          ...styles.link,
          ...(isActive('/dashboard') ? styles.activeLink : {})
        }}>
          <FiGrid size={16} />
          Dashboard
        </Link>
        <Link to="/proyectos" style={{
          ...styles.link,
          ...(isActive('/proyectos') ? styles.activeLink : {})
        }}>
          <FiFolder size={16} />
          Proyectos
        </Link>
        <Link to="/recursos" style={{
          ...styles.link,
          ...(isActive('/recursos') ? styles.activeLink : {})
        }}>
          <FiUsers size={16} />
          Recursos
        </Link>
      </div>

      {/* Sección derecha: usuario, modo oscuro, logout */}
      <div style={styles.rightSection}>
        {/* Botón modo oscuro/claro */}
        <button onClick={toggleDarkMode} style={styles.themeBtn} title="Cambiar tema">
          {darkMode ? <FiSun size={18} color="#fbbf24" /> : <FiMoon size={18} color="white" />}
        </button>

        {/* Info del usuario */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{username?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.username}>{username}</div>
            <div style={styles.userRol}>
              {rol === 'ADMIN' ? '👑 Admin' : 
              rol === 'JEFE_PROYECTO' ? '🎯 Jefe de Proyecto' : 
              '👤 Usuario'}
            </div>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <button onClick={handleLogout} style={styles.logoutBtn} title="Cerrar sesión">
          <FiLogOut size={16} />
          Salir
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: { fontSize: '28px' },
  brandText: { color: 'white', fontSize: '17px', fontWeight: '700', display: 'block' },
  brandSub: { color: 'rgba(255,255,255,0.55)', fontSize: '11px', display: 'block' },
  links: { display: 'flex', alignItems: 'center', gap: '4px' },
  link: {
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: 'white',
    fontWeight: '700',
  },
  rightSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  themeBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px', height: '36px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: '800', fontSize: '15px',
    border: '2px solid rgba(255,255,255,0.35)',
  },
  username: { color: 'white', fontSize: '14px', fontWeight: '600' },
  userRol: { color: 'rgba(255,255,255,0.55)', fontSize: '11px' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
};

export default Navbar;