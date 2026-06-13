import React from 'react';
import { FiLayers, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../App';
import './AuthLayout.css';

function AuthLayout({ eyebrow, title, description, highlights, children }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <main className="auth-shell">
      <button
        type="button"
        className="auth-theme-button"
        onClick={toggleDarkMode}
        aria-label={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
        title={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
      >
        {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <section className="auth-context">
        <div className="auth-context__content">
          <div className="auth-brand">
            <span className="auth-brand__mark"><FiLayers size={24} /></span>
            <span>
              <strong>Innovatech Solutions</strong>
              <small>Plataforma de gestión</small>
            </span>
          </div>

          <div className="auth-context__heading">
            <span className="auth-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="auth-highlights">
            {highlights.map(({ icon, title: itemTitle, text }) => (
              <div className="auth-highlight" key={itemTitle}>
                <span className="auth-highlight__icon">{icon}</span>
                <span>
                  <strong>{itemTitle}</strong>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-form-area">
        <div className="auth-card page-enter">{children}</div>
      </section>
    </main>
  );
}

export default AuthLayout;
