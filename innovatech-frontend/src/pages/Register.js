import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FiUser, FiMail, FiLock, FiShield, FiInfo } from 'react-icons/fi';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', rol: 'USUARIO' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Valida contraseña en tiempo real mientras el usuario escribe
    if (e.target.name === 'password') {
      validarPassword(e.target.value);
    }
  };

  // Valida los requisitos de la contraseña en tiempo real
  // Muestra qué requisitos faltan mientras el usuario escribe
  const validarPassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[a-zA-Z]/.test(password)) errors.push('Al menos una letra');
    if (!/[0-9]/.test(password)) errors.push('Al menos un número');
    if (!password.includes('@')) errors.push('Debe contener @');
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Verifica que la contraseña cumpla todos los requisitos antes de enviar
    if (passwordErrors.length > 0) {
      setError('La contraseña no cumple los requisitos mínimos');
      return;
    }
    try {
      await authService.register(form);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Muestra el mensaje de error del backend
      const msg = err.response?.data?.message || err.response?.data || 'El usuario o email ya existe.';
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      {/* Panel izquierdo */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}><span style={styles.logoIcon}>🏢</span></div>
          <h1 style={styles.logoText}>Únete a Innovatech</h1>
          <p style={styles.logoSub}>Crea tu cuenta y accede a la plataforma de gestión más completa</p>
          <div style={styles.steps}>
            {[
              { num: '1', text: 'Completa el formulario' },
              { num: '2', text: 'Crea una contraseña segura' },
              { num: '3', text: 'Accede al sistema' },
            ].map((s, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{s.num}</div>
                <span>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Requisitos de contraseña en el panel izquierdo */}
          <div style={styles.passwordReqs}>
            <p style={styles.passwordReqTitle}>🔐 Requisitos de contraseña:</p>
            {[
              'Mínimo 8 caracteres',
              'Al menos una letra',
              'Al menos un número',
              'Debe contener @',
            ].map((req, i) => (
              <div key={i} style={styles.passwordReq}>
                <span style={styles.passwordReqIcon}>✓</span>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Crear Cuenta</h2>
          <p style={styles.subtitle}>Completa los datos para registrarte</p>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          {success && <div style={styles.successBox}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Campo usuario */}
            <div style={styles.field}>
              <label style={styles.label}>Usuario</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><FiUser size={16} /></span>
                <input name="username" type="text" value={form.username}
                  onChange={handleChange} style={styles.input}
                  placeholder="Nombre de usuario" required minLength={3} />
              </div>
              <small style={styles.hint}>Mínimo 3 caracteres</small>
            </div>

            {/* Campo email */}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><FiMail size={16} /></span>
                <input name="email" type="email" value={form.email}
                  onChange={handleChange} style={styles.input}
                  placeholder="tu@email.com" required />
              </div>
            </div>

            {/* Campo contraseña con validación en tiempo real */}
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><FiLock size={16} /></span>
                <input name="password" type="password" value={form.password}
                  onChange={handleChange} style={{
                    ...styles.input,
                    // Cambia borde según validez de contraseña
                    borderColor: form.password.length === 0 ? '#e2e8f0' :
                      passwordErrors.length === 0 ? '#22c55e' : '#ef4444'
                  }}
                  placeholder="Ej: MiPass@123" required />
              </div>
              {/* Muestra errores de contraseña en tiempo real */}
              {form.password.length > 0 && passwordErrors.length > 0 && (
                <div style={styles.passwordErrorList}>
                  {passwordErrors.map((err, i) => (
                    <div key={i} style={styles.passwordErrorItem}>
                      ❌ {err}
                    </div>
                  ))}
                </div>
              )}
              {/* Muestra mensaje de éxito cuando la contraseña es válida */}
              {form.password.length > 0 && passwordErrors.length === 0 && (
                <div style={styles.passwordSuccess}>✅ Contraseña válida</div>
              )}
            </div>

            {/* Campo rol - solo USUARIO disponible en registro público */}
            <div style={styles.field}>
              <label style={styles.label}>Rol de Acceso</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><FiShield size={16} /></span>
                <select name="rol" value={form.rol}
                  onChange={handleChange} style={styles.input} disabled>
                  {/* Solo USUARIO disponible — los otros roles los asigna el ADMIN */}
                  <option value="USUARIO">👤 Usuario — Puede dar visto bueno a proyectos</option>
                </select>
              </div>
              {/* Nota informativa sobre los roles */}
              <div style={styles.infoBox}>
                <FiInfo size={14} />
                <span>Los roles de <strong>Jefe de Proyecto</strong> y <strong>Administrador</strong> son asignados por el administrador del sistema.</span>
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
  logoSub: { fontSize: '15px', opacity: 0.7, marginBottom: '24px', lineHeight: 1.6 },
  steps: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  step: {
    display: 'flex', alignItems: 'center', gap: '14px',
    backgroundColor: 'rgba(255,255,255,0.08)', padding: '12px 16px',
    borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)',
  },
  stepNum: {
    width: '28px', height: '28px', backgroundColor: 'white', color: '#1a237e',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '13px', flexShrink: 0,
  },
  passwordReqs: {
    backgroundColor: 'rgba(255,255,255,0.08)', padding: '16px',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
  },
  passwordReqTitle: { fontSize: '13px', fontWeight: '700', marginBottom: '10px', opacity: 0.9 },
  passwordReq: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
    opacity: 0.8, marginBottom: '6px' },
  passwordReqIcon: { color: '#22c55e', fontWeight: '700' },
  rightPanel: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '48px', backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: 'white', padding: '40px', borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.12)', width: '100%', maxWidth: '440px',
  },
  title: { fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '15px', marginBottom: '24px' },
  errorBox: {
    backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fecaca',
  },
  successBox: {
    backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '16px', fontSize: '14px', border: '1px solid #bbf7d0',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#374151' },
  hint: { fontSize: '12px', color: '#94a3b8' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#94a3b8', display: 'flex' },
  input: {
    width: '100%', padding: '12px 14px 12px 42px',
    borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none', color: '#0f172a',
    transition: 'border-color 0.2s',
  },
  passwordErrorList: {
    backgroundColor: '#fef2f2', borderRadius: '8px', padding: '10px 12px',
    border: '1px solid #fecaca',
  },
  passwordErrorItem: { fontSize: '12px', color: '#dc2626', marginBottom: '4px' },
  passwordSuccess: {
    fontSize: '12px', color: '#16a34a', fontWeight: '600',
  },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    backgroundColor: '#eff6ff', padding: '10px 12px', borderRadius: '8px',
    fontSize: '12px', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  btn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #1a237e, #1565c0)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(26,35,126,0.35)',
  },
  loginText: { textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' },
  loginLink: { color: '#1565c0', fontWeight: '700', textDecoration: 'none' },
};

export default Register;