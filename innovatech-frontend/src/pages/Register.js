import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', rol: 'USER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authService.register(form);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('El usuario o email ya existe.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}><span style={styles.logoIcon}>🏢</span></div>
          <h1 style={styles.logoText}>Únete a Innovatech</h1>
          <p style={styles.logoSub}>Crea tu cuenta y accede a la plataforma de gestión más completa</p>
          <div style={styles.steps}>
            {[
              { num: '1', text: 'Completa el formulario' },
              { num: '2', text: 'Elige tu rol de acceso' },
              { num: '3', text: 'Accede al sistema' },
            ].map((s, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{s.num}</div>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Crear Cuenta</h2>
          <p style={styles.subtitle}>Completa los datos para registrarte</p>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          {success && <div style={styles.successBox}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              { name: 'username', label: 'Usuario', icon: <FiUser size={16} />, placeholder: 'Nombre de usuario', type: 'text' },
              { name: 'email', label: 'Email', icon: <FiMail size={16} />, placeholder: 'tu@email.com', type: 'email' },
              { name: 'password', label: 'Contraseña', icon: <FiLock size={16} />, placeholder: 'Tu contraseña', type: 'password' },
            ].map((f) => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>{f.icon}</span>
                  <input name={f.name} type={f.type} value={form[f.name]}
                    onChange={handleChange} style={styles.input}
                    placeholder={f.placeholder} required />
                </div>
              </div>
            ))}

            <div style={styles.field}>
              <label style={styles.label}>Rol de Acceso</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><FiShield size={16} /></span>
                <select name="rol" value={form.rol} onChange={handleChange} style={styles.input}>
                  <option value="USER">👤 Usuario — Solo lectura</option>
                  <option value="ADMIN">👑 Administrador — Acceso completo</option>
                </select>
              </div>
            </div>

            <button type="submit" style={styles.btn}>✨ Crear Cuenta</button>
          </form>

          <p style={styles.loginText}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={styles.loginLink}>Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex' },
  leftPanel: {
    flex: '1',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1a237e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px',
  },
  leftContent: { color: 'white', maxWidth: '380px' },
  logoWrap: {
    width: '72px', height: '72px', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)',
  },
  logoIcon: { fontSize: '36px' },
  logoText: { fontSize: '28px', fontWeight: '800', marginBottom: '12px' },
  logoSub: { fontSize: '15px', opacity: 0.7, marginBottom: '40px', lineHeight: 1.6 },
  steps: { display: 'flex', flexDirection: 'column', gap: '14px' },
  step: {
    display: 'flex', alignItems: 'center', gap: '14px',
    backgroundColor: 'rgba(255,255,255,0.08)', padding: '14px 18px',
    borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)',
  },
  stepNum: {
    width: '28px', height: '28px', backgroundColor: 'white', color: '#1a237e',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '13px', flexShrink: 0,
  },
  rightPanel: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '48px', backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: 'white', padding: '48px', borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px',
  },
  title: { fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '15px', marginBottom: '28px' },
  errorBox: {
    backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca',
  },
  successBox: {
    backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid #bbf7d0',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#374151' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#94a3b8', display: 'flex' },
  input: {
    width: '100%', padding: '13px 14px 13px 42px',
    borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none', color: '#0f172a',
  },
  btn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #1a237e, #1565c0)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(26,35,126,0.35)',
  },
  loginText: { textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' },
  loginLink: { color: '#1565c0', fontWeight: '700', textDecoration: 'none' },
};

export default Register;