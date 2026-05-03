import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('rol', response.data.rol);
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Panel izquierdo */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}>
            <span style={styles.logoIcon}>🏢</span>
          </div>
          <h1 style={styles.logoText}>Innovatech Solutions</h1>
          <p style={styles.logoSub}>Plataforma Inteligente de Gestión de Proyectos y Recursos</p>
          <div style={styles.features}>
            {[
              { icon: '📊', text: 'Dashboard con métricas en tiempo real' },
              { icon: '📋', text: 'Gestión completa de proyectos' },
              { icon: '👥', text: 'Administración de recursos humanos' },
              { icon: '🔐', text: 'Seguridad con autenticación JWT' },
            ].map((f, i) => (
              <div key={i} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <h2 style={styles.title}>Bienvenido de vuelta</h2>
            <p style={styles.subtitle}>Ingresa tus credenciales para acceder</p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Usuario</label>
              <div style={styles.inputWrap}>
                <FiUser style={styles.inputIcon} size={16} />
                <input name="username" value={form.username} onChange={handleChange}
                  style={styles.input} placeholder="Tu nombre de usuario" required />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrap}>
                <FiLock style={styles.inputIcon} size={16} />
                <input name="password" type="password" value={form.password}
                  onChange={handleChange} style={styles.input} placeholder="Tu contraseña" required />
              </div>
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? '⏳ Verificando...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Iniciar Sesión <FiArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <p style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={styles.registerLink}>Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex' },
  leftPanel: {
    flex: '1.2',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1a237e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px',
  },
  leftContent: { color: 'white', maxWidth: '420px' },
  logoWrap: {
    width: '72px', height: '72px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '20px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)',
  },
  logoIcon: { fontSize: '36px' },
  logoText: { fontSize: '30px', fontWeight: '800', marginBottom: '12px', lineHeight: 1.2 },
  logoSub: { fontSize: '15px', opacity: 0.7, marginBottom: '40px', lineHeight: 1.6 },
  features: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: {
    display: 'flex', alignItems: 'center', gap: '14px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: '14px 18px', borderRadius: '12px',
    fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)',
  },
  featureIcon: { fontSize: '20px', flexShrink: 0 },
  rightPanel: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '48px',
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: 'white', padding: '48px', borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px',
  },
  cardTop: { marginBottom: '32px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '15px' },
  errorBox: {
    backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '14px',
    border: '1px solid #fecaca',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.3px' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#94a3b8' },
  input: {
    width: '100%', padding: '13px 14px 13px 42px',
    borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', color: '#0f172a',
    transition: 'border-color 0.2s',
  },
  btn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #1a237e, #1565c0)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    marginTop: '8px', boxShadow: '0 8px 25px rgba(26,35,126,0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  registerText: { textAlign: 'center', marginTop: '28px', color: '#64748b', fontSize: '14px' },
  registerLink: { color: '#1565c0', fontWeight: '700', textDecoration: 'none' },
};

export default Login;