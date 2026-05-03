import React, { useState, useEffect } from 'react';
import { recursosService } from '../services/api';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMail, FiBriefcase } from 'react-icons/fi';

function Recursos() {
  const [recursos, setRecursos] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', cargo: '',
    departamento: '', disponibilidad: 'DISPONIBLE', nivelExperiencia: 'JUNIOR' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { darkMode } = useTheme();
  const rol = localStorage.getItem('rol');
  const esAdmin = rol === 'ADMIN';

  const colors = {
    bg: darkMode ? '#0f172a' : '#f0f2f5',
    card: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#0f172a' : 'white',
    inputText: darkMode ? '#f1f5f9' : '#0f172a',
    cardBg: darkMode ? '#1e293b' : 'white',
    cardHeader: darkMode ? '#273344' : '#f8f9ff',
  };

  useEffect(() => { fetchRecursos(); }, []);

  const fetchRecursos = async () => {
    const response = await recursosService.getAll();
    setRecursos(response.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) { await recursosService.update(editId, form); }
    else { await recursosService.create(form); }
    setForm({ nombre: '', apellido: '', email: '', cargo: '',
      departamento: '', disponibilidad: 'DISPONIBLE', nivelExperiencia: 'JUNIOR' });
    setEditId(null); setShowForm(false); fetchRecursos();
  };

  const handleEdit = (r) => {
    setForm({ nombre: r.nombre, apellido: r.apellido, email: r.email,
      cargo: r.cargo, departamento: r.departamento,
      disponibilidad: r.disponibilidad, nivelExperiencia: r.nivelExperiencia });
    setEditId(r.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este empleado?')) {
      await recursosService.delete(id); fetchRecursos();
    }
  };

  const dispConfig = {
    'DISPONIBLE': { color: '#22c55e', label: '🟢 Disponible' },
    'OCUPADO': { color: '#f59e0b', label: '🟡 Ocupado' },
    'VACACIONES': { color: '#3b82f6', label: '🏖️ Vacaciones' },
  };

  const nivelConfig = {
    'JUNIOR': { color: '#a855f7', label: '🌱 Junior' },
    'SEMI_SENIOR': { color: '#6366f1', label: '⭐ Semi Senior' },
    'SENIOR': { color: '#f59e0b', label: '🌟 Senior' },
  };

  // Genera color de avatar basado en las iniciales
  const avatarColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, transition: 'all 0.3s' }}>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>Recursos Humanos</h1>
            <p style={{ color: colors.subtext, fontSize: '14px' }}>
              {recursos.length} empleado(s) registrado(s)
            </p>
          </div>
          {esAdmin && (
            <button
              style={showForm ? { padding: '11px 20px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: colors.card, color: colors.subtext, border: `2px solid ${colors.border}` }
                : styles.btnPrimary}
              onClick={() => { setShowForm(!showForm); setEditId(null);
                setForm({ nombre: '', apellido: '', email: '', cargo: '',
                  departamento: '', disponibilidad: 'DISPONIBLE', nivelExperiencia: 'JUNIOR' }); }}>
              {showForm ? <><FiX size={16} /> Cancelar</> : <><FiPlus size={16} /> Nuevo Empleado</>}
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && esAdmin && (
          <div style={{ ...styles.formCard, backgroundColor: colors.card, borderColor: colors.border }}>
            <h3 style={{ ...styles.formTitle, color: colors.text }}>
              {editId ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {[
                  { name: 'nombre', label: 'Nombre *', placeholder: 'Nombre', type: 'text' },
                  { name: 'apellido', label: 'Apellido *', placeholder: 'Apellido', type: 'text' },
                  { name: 'email', label: 'Email *', placeholder: 'email@innovatech.cl', type: 'email' },
                  { name: 'cargo', label: 'Cargo *', placeholder: 'Ej: Desarrollador', type: 'text' },
                  { name: 'departamento', label: 'Departamento *', placeholder: 'Ej: Desarrollo', type: 'text' },
                ].map(f => (
                  <div key={f.name} style={styles.field}>
                    <label style={{ ...styles.label, color: colors.subtext }}>{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder}
                      value={form[f.name]} onChange={handleChange} required
                      style={{ ...styles.input, backgroundColor: colors.input,
                        color: colors.inputText, borderColor: colors.border }} />
                  </div>
                ))}
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Disponibilidad</label>
                  <select name="disponibilidad" value={form.disponibilidad} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input,
                      color: colors.inputText, borderColor: colors.border }}>
                    <option value="DISPONIBLE">🟢 Disponible</option>
                    <option value="OCUPADO">🟡 Ocupado</option>
                    <option value="VACACIONES">🏖️ Vacaciones</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Nivel</label>
                  <select name="nivelExperiencia" value={form.nivelExperiencia} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input,
                      color: colors.inputText, borderColor: colors.border }}>
                    <option value="JUNIOR">🌱 Junior</option>
                    <option value="SEMI_SENIOR">⭐ Semi Senior</option>
                    <option value="SENIOR">🌟 Senior</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" style={styles.btnSuccess}>
                  {editId ? '💾 Actualizar' : '✨ Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cards de empleados */}
        {recursos.length === 0 ? (
          <div style={{ ...styles.emptyState, backgroundColor: colors.card, color: colors.subtext }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>Sin empleados registrados</div>
            {esAdmin && <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Haz clic en "+ Nuevo Empleado" para comenzar
            </div>}
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {recursos.map(r => {
              const disp = dispConfig[r.disponibilidad] || {};
              const nivel = nivelConfig[r.nivelExperiencia] || {};
              const avatarColor = getAvatarColor(r.nombre);
              return (
                <div key={r.id} style={{ ...styles.employeeCard, backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
                  {/* Header de la card */}
                  <div style={{ ...styles.cardHeader, backgroundColor: colors.cardHeader,
                    borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ ...styles.avatar, backgroundColor: avatarColor }}>
                      {r.nombre[0]}{r.apellido[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: colors.text,
                        fontSize: '15px', marginBottom: '2px' }}>
                        {r.nombre} {r.apellido}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.subtext,
                        display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiBriefcase size={11} /> {r.cargo}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '13px', color: colors.subtext, marginBottom: '8px' }}>
                      <FiMail size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.email}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: colors.subtext, marginBottom: '12px' }}>
                      🏢 {r.departamento}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: `${disp.color}22`, color: disp.color,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '700', border: `1px solid ${disp.color}44` }}>
                        {disp.label}
                      </span>
                      <span style={{ backgroundColor: `${nivel.color}22`, color: nivel.color,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '700', border: `1px solid ${nivel.color}44` }}>
                        {nivel.label}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {esAdmin && (
                    <div style={{ ...styles.cardActions, borderTop: `1px solid ${colors.border}`,
                      backgroundColor: darkMode ? '#273344' : '#fafafa' }}>
                      <button onClick={() => handleEdit(r)} style={styles.btnEdit}>
                        <FiEdit2 size={13} /> Editar
                      </button>
                      <button onClick={() => handleDelete(r.id)} style={styles.btnDelete}>
                        <FiTrash2 size={13} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  btnPrimary: {
    background: 'linear-gradient(135deg, #1a237e, #1565c0)', color: 'white',
    border: 'none', padding: '11px 20px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: '0 4px 15px rgba(26,35,126,0.3)',
  },
  btnSuccess: {
    background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
    border: 'none', padding: '11px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 15px rgba(22,163,74,0.3)',
  },
  formCard: {
    borderRadius: '16px', padding: '28px', marginBottom: '24px',
    borderTop: '4px solid #1a237e', border: '1px solid',
  },
  formTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  input: {
    padding: '10px 14px', borderRadius: '8px', border: '2px solid',
    fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' },
  employeeCard: { borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' },
  avatar: {
    width: '46px', height: '46px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0,
  },
  cardBody: { padding: '16px 20px' },
  cardActions: { display: 'flex', gap: '8px', padding: '12px 16px' },
  btnEdit: {
    flex: 1, backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none',
    padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  },
  btnDelete: {
    flex: 1, backgroundColor: '#fef2f2', color: '#dc2626', border: 'none',
    padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  },
  emptyState: {
    textAlign: 'center', padding: '64px', borderRadius: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};

export default Recursos;