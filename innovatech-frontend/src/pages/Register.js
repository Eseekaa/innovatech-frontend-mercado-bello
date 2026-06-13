import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiInfo,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../services/api';

const passwordRules = [
  { label: '8 caracteres', validate: value => value.length >= 8 },
  { label: 'Una letra', validate: value => /[a-zA-Z]/.test(value) },
  { label: 'Un número', validate: value => /[0-9]/.test(value) },
  { label: 'Símbolo @', validate: value => value.includes('@') },
];

function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', rol: 'USUARIO' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const passwordValid = passwordRules.every(rule => rule.validate(form.password));

  const handleChange = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('La contraseña todavía no cumple todos los requisitos de seguridad.');
      return;
    }

    try {
      await authService.register(form);
      setSuccess('Cuenta creada correctamente. Te llevaremos al inicio de sesión.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (requestError) {
      const message = requestError.response?.data?.message
        || requestError.response?.data
        || 'El usuario o correo ya se encuentra registrado.';
      setError(message);
    }
  };

  const highlights = [
    { icon: <FiClipboard size={18} />, title: 'Trabajo organizado', text: 'Consulta tus proyectos y tareas asignadas.' },
    { icon: <FiUsers size={18} />, title: 'Responsabilidades claras', text: 'Cada integrante conoce su carga y avance.' },
    { icon: <FiShield size={18} />, title: 'Permisos controlados', text: 'El administrador gestiona los roles superiores.' },
  ];

  return (
    <AuthLayout
      eyebrow="Acceso a Innovatech"
      title="Crea tu espacio de trabajo en minutos."
      description="Regístrate como usuario para consultar información y participar en las tareas que te sean asignadas."
      highlights={highlights}
    >
      <div className="auth-card__header">
        <h2>Crear cuenta</h2>
        <p>Completa tus datos de acceso. Los campos son obligatorios.</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" role="alert">
          <FiAlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="auth-alert auth-alert--success" role="status">
          <FiCheckCircle size={17} />
          <span>{success}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="register-username">Usuario</label>
          <div className="auth-input-wrap">
            <FiUser size={16} />
            <input
              id="register-username"
              className="auth-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Mínimo 3 caracteres"
              autoComplete="username"
              minLength={3}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Correo electrónico</label>
          <div className="auth-input-wrap">
            <FiMail size={16} />
            <input
              id="register-email"
              className="auth-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nombre@empresa.cl"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Contraseña</label>
          <div className="auth-input-wrap">
            <FiLock size={16} />
            <input
              id="register-password"
              className={`auth-input ${form.password ? (passwordValid ? 'auth-input--valid' : 'auth-input--invalid') : ''}`}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ejemplo: Clave@2026"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="auth-requirements" aria-label="Requisitos de contraseña">
            {passwordRules.map(rule => {
              const valid = rule.validate(form.password);
              return (
                <span className={`auth-requirement ${valid ? 'auth-requirement--valid' : ''}`} key={rule.label}>
                  <FiCheck size={13} /> {rule.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-role">Rol inicial</label>
          <div className="auth-input-wrap">
            <FiShield size={16} />
            <select id="register-role" className="auth-input" name="rol" value={form.rol} disabled>
              <option value="USUARIO">Usuario</option>
            </select>
          </div>
          <div className="auth-info">
            <FiInfo size={15} />
            <span>Los roles Jefe de Proyecto y Administrador son asignados por un administrador.</span>
          </div>
        </div>

        <button className="auth-submit" type="submit">Crear cuenta</button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
