import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiActivity, FiAlertCircle, FiArrowRight, FiLock, FiShield, FiUser, FiUsers } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../services/api';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('rol', response.data.rol);
      navigate('/dashboard');
    } catch (requestError) {
      setError('Usuario o contraseña incorrectos. Revisa los datos e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { icon: <FiActivity size={18} />, title: 'Control operativo', text: 'Proyectos, tareas y avance en un solo lugar.' },
    { icon: <FiUsers size={18} />, title: 'Equipos conectados', text: 'Asignaciones claras por proyecto y responsable.' },
    { icon: <FiShield size={18} />, title: 'Acceso seguro', text: 'Autenticación JWT y permisos según cada rol.' },
  ];

  return (
    <AuthLayout
      eyebrow="Plataforma empresarial"
      title="Decisiones claras para equipos que avanzan."
      description="Centraliza la gestión de proyectos, recursos y tareas con indicadores que permiten actuar a tiempo."
      highlights={highlights}
    >
      <div className="auth-card__header">
        <h2>Bienvenido</h2>
        <p>Ingresa tus credenciales para acceder a tu espacio de trabajo.</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" role="alert">
          <FiAlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="username">Usuario</label>
          <div className="auth-input-wrap">
            <FiUser size={16} />
            <input
              id="username"
              className="auth-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="password">Contraseña</label>
          <div className="auth-input-wrap">
            <FiLock size={16} />
            <input
              id="password"
              className="auth-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Verificando acceso...' : <><span>Iniciar sesión</span><FiArrowRight size={17} /></>}
        </button>
      </form>

      <p className="auth-switch">
        ¿Aún no tienes una cuenta? <Link to="/register">Crear cuenta</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
