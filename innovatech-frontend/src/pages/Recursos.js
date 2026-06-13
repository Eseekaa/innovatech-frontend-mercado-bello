import React, { useState, useEffect } from 'react';
import { recursosService, proyectosService } from '../services/api';
import Navbar from '../components/Navbar';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMail, FiBriefcase, FiUsers } from 'react-icons/fi';

function Recursos() {
  const [recursos, setRecursos] = useState([]);
  const [proyectos, setProyectos] = useState([]); // Lista de proyectos para asignar empleados
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', cargo: '',
    departamento: '', disponibilidad: 'DISPONIBLE',
    nivelExperiencia: 'JUNIOR', idProyectos: []
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const rol = localStorage.getItem('rol');
  
  // Jerarquia de permisos:
  // USUARIO: solo visualiza recursos.
  // JEFE_PROYECTO: crea/edita recursos y asigna empleados a proyectos.
  // ADMIN: hereda lo anterior y ademas puede eliminar recursos.
  const esAdmin = rol === 'ADMIN';
  const esJefe = rol === 'JEFE_PROYECTO';
  const puedeGestionarRecursos = esAdmin || esJefe;
  const puedeEliminarRecursos = esAdmin;

  const colors = {
    bg: 'var(--app-bg)',
    card: 'var(--surface)',
    text: 'var(--text-primary)',
    subtext: 'var(--text-secondary)',
    border: 'var(--border)',
    input: 'var(--surface-subtle)',
    inputText: 'var(--text-primary)',
    cardBg: 'var(--surface)',
    cardHeader: 'var(--surface-subtle)',
  };

  // Carga empleados y proyectos al iniciar
  useEffect(() => {
    fetchRecursos();
    fetchProyectos();
  }, []);

  const mostrarMensaje = (tipo, texto) => {
    // Mensaje temporal para confirmar acciones sin revisar la consola ni H2.
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 2800);
  };

  const fetchRecursos = async () => {
    const response = await recursosService.getAll();
    setRecursos(response.data);
  };

  // Carga proyectos para mostrarlos en el select del formulario
  const fetchProyectos = async () => {
    try {
      const response = await proyectosService.getAll();
      setProyectos(response.data);
    } catch (err) {
      console.error('Error cargando proyectos:', err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProyectoToggle = (idProyecto) => {
    const id = Number(idProyecto);
    const actuales = form.idProyectos || [];
    const nuevos = actuales.includes(id)
      ? actuales.filter(item => item !== id)
      : [...actuales, id];
    setForm({ ...form, idProyectos: nuevos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // idProyecto mantiene compatibilidad con la columna antigua de H2.
    // idProyectos es la lista real para asignar un empleado a varios proyectos.
    const data = {
      ...form,
      idProyecto: form.idProyectos.length > 0 ? form.idProyectos[0] : null,
      idProyectos: form.idProyectos
    };
    try {
      if (editId) {
        await recursosService.update(editId, data);
        mostrarMensaje('success', 'Empleado actualizado correctamente.');
      } else {
        await recursosService.create(data);
        mostrarMensaje('success', 'Empleado creado correctamente.');
      }
      setForm({ nombre: '', apellido: '', email: '', cargo: '',
        departamento: '', disponibilidad: 'DISPONIBLE',
        nivelExperiencia: 'JUNIOR', idProyectos: [] });
      setEditId(null); setShowForm(false); fetchRecursos();
    } catch (err) {
      mostrarMensaje('error', 'No se pudo guardar el empleado.');
    }
  };

  const handleEdit = (r) => {
    setForm({
      nombre: r.nombre, apellido: r.apellido, email: r.email,
      cargo: r.cargo, departamento: r.departamento,
      disponibilidad: r.disponibilidad, nivelExperiencia: r.nivelExperiencia,
      idProyectos: getIdsProyectos(r)
    });
    setEditId(r.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este empleado?')) {
      try {
        await recursosService.delete(id);
        mostrarMensaje('success', 'Empleado eliminado correctamente.');
        fetchRecursos();
      } catch (err) {
        mostrarMensaje('error', 'No se pudo eliminar el empleado.');
      }
    }
  };

  const getIdsProyectos = (recurso) => {
    if (Array.isArray(recurso.idProyectos) && recurso.idProyectos.length > 0) return recurso.idProyectos;
    return recurso.idProyecto ? [recurso.idProyecto] : [];
  };

  // Busca el nombre del proyecto por ID para mostrarlo en la card
  const getNombreProyecto = (idProyecto) => {
    if (!idProyecto) return 'Sin proyecto asignado';
    // Compara como texto para que funcione aunque el ID venga como numero o string.
    const proyecto = proyectos.find(p => String(p.id) === String(idProyecto));
    return proyecto ? proyecto.nombre : `Proyecto #${idProyecto}`;
  };

  const getRecursosPorProyecto = (idProyecto) => {
    // Relaciona proyectos con empleados usando la lista de proyectos del recurso.
    return recursos.filter(r => getIdsProyectos(r).map(String).includes(String(idProyecto)));
  };

  const getNombresProyectos = (recurso) => {
    const ids = getIdsProyectos(recurso);
    if (ids.length === 0) return 'Sin proyecto asignado';
    return ids.map(getNombreProyecto).join(', ');
  };

  const dispConfig = {
    'DISPONIBLE': { color: '#0f9f6e', label: 'Disponible' },
    'OCUPADO': { color: '#c77800', label: 'Ocupado' },
    'VACACIONES': { color: '#2563eb', label: 'Vacaciones' },
  };

  const nivelConfig = {
    'JUNIOR': { color: '#087ea4', label: 'Junior' },
    'SEMI_SENIOR': { color: '#2563eb', label: 'Semi Senior' },
    'SENIOR': { color: '#c77800', label: 'Senior' },
  };

  const avatarColors = ['#2563eb', '#0f9f6e', '#c77800', '#d63c48', '#087ea4', '#7c5ce5'];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="app-page" style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <main className="app-main page-enter" style={styles.container}>
        {mensaje && (
          <div style={{
            ...styles.toast,
            backgroundColor: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
            color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c',
            borderColor: mensaje.tipo === 'success' ? '#86efac' : '#fecaca',
          }}>
            {mensaje.texto}
          </div>
        )}
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>Recursos Humanos</h1>
            <p style={{ color: colors.subtext, fontSize: '14px' }}>
              {recursos.length} empleado(s) registrado(s)
            </p>
          </div>
          {/* ADMIN y JEFE_PROYECTO pueden crear empleados */}
          {puedeGestionarRecursos && (
            <button
              style={showForm ? {
                padding: '11px 20px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: colors.card, color: colors.subtext, border: `2px solid ${colors.border}`
              } : styles.btnPrimary}
              onClick={() => {
                setShowForm(!showForm); setEditId(null);
                setForm({ nombre: '', apellido: '', email: '', cargo: '',
                  departamento: '', disponibilidad: 'DISPONIBLE',
                  nivelExperiencia: 'JUNIOR', idProyectos: [] });
              }}>
              {showForm ? <><FiX size={16} /> Cancelar</> : <><FiPlus size={16} /> Nuevo Empleado</>}
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && puedeGestionarRecursos && (
          <div style={{ ...styles.formCard, backgroundColor: colors.card, borderColor: colors.border }}>
            <h3 style={{ ...styles.formTitle, color: colors.text }}>
              {editId ? <><FiEdit2 size={18} /> Editar empleado</> : <><FiPlus size={18} /> Nuevo empleado</>}
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
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADO">Ocupado</option>
                    <option value="VACACIONES">Vacaciones</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Nivel</label>
                  <select name="nivelExperiencia" value={form.nivelExperiencia} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input,
                      color: colors.inputText, borderColor: colors.border }}>
                    <option value="JUNIOR">Junior</option>
                    <option value="SEMI_SENIOR">Semi Senior</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>

                {/* Campo para asignar uno o varios proyectos al recurso */}
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={{ ...styles.label, color: colors.subtext }}>
                    Proyectos asignados
                  </label>
                  <div style={{ ...styles.projectChecks, borderColor: colors.border }}>
                    {proyectos.length === 0 ? (
                      <span style={{ color: colors.subtext }}>No hay proyectos disponibles</span>
                    ) : proyectos.map(p => (
                      <label key={p.id} style={{ ...styles.projectCheck, color: colors.text }}>
                        <input
                          type="checkbox"
                          checked={(form.idProyectos || []).includes(p.id)}
                          onChange={() => handleProyectoToggle(p.id)}
                        />
                        {p.nombre} ({p.estado})
                      </label>
                    ))}
                  </div>
                  <small style={{ color: colors.subtext, fontSize: '12px' }}>
                    ID_PROYECTO guarda el primero: {form.idProyectos[0] || 'null'}
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" style={styles.btnSuccess}>
                  {editId ? 'Guardar asignacion del empleado' : 'Crear empleado'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumen de la relacion proyecto -> empleados */}
        <div style={styles.assignmentSection}>
          <h2 style={{ ...styles.sectionTitle, color: colors.text }}>Proyectos y empleados asignados</h2>
          <div style={styles.assignmentGrid}>
            {proyectos.length === 0 ? (
              <div style={{ ...styles.assignmentCard, backgroundColor: colors.card, borderColor: colors.border, color: colors.subtext }}>
                No hay proyectos cargados desde el BFF.
              </div>
            ) : proyectos.map(p => {
              const asignados = getRecursosPorProyecto(p.id);
              return (
                <div key={p.id} style={{ ...styles.assignmentCard, backgroundColor: colors.card, borderColor: colors.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: colors.text }}>{p.nombre}</div>
                      <div style={{ fontSize: '12px', color: colors.subtext }}>Responsable: {p.responsable || 'Sin responsable'}</div>
                    </div>
                    <span style={styles.projectIdBadge}>ID {p.id}</span>
                  </div>
                  {asignados.length === 0 ? (
                    <div style={{ fontSize: '13px', color: colors.subtext }}>Sin empleados asignados</div>
                  ) : (
                    <div style={styles.assignedPeople}>
                      {asignados.map(r => (
                        <span key={r.id} style={styles.assignedPersonBadge}>
                          {r.nombre} {r.apellido}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cards de empleados */}
        {recursos.length === 0 ? (
          <div style={{ ...styles.emptyState, backgroundColor: colors.card, color: colors.subtext }}>
            <FiUsers size={42} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '18px', fontWeight: '600' }}>Sin empleados registrados</div>
            {puedeGestionarRecursos && (
              <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                Usa el botón Nuevo empleado para comenzar.
              </div>
            )}
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {recursos.map(r => {
              const disp = dispConfig[r.disponibilidad] || {};
              const nivel = nivelConfig[r.nivelExperiencia] || {};
              const avatarColor = getAvatarColor(r.nombre);
              const nombresProyectos = getNombresProyectos(r);
              return (
                <div key={r.id} style={{
                  ...styles.employeeCard, backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: 'var(--shadow-sm)'
                }}>
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
                    <div style={{ fontSize: '13px', color: colors.subtext, marginBottom: '8px',
                      display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiBriefcase size={13} /> {r.departamento}
                    </div>

                    {/* Muestra siempre el proyecto para verificar la asignacion en pantalla */}
                    <div style={{ fontSize: '13px', marginBottom: '8px',
                      color: getIdsProyectos(r).length > 0 ? '#6366f1' : colors.subtext, fontWeight: '600',
                      display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Proyectos: {nombresProyectos}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: `${disp.color}22`, color: disp.color,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '700', border: `1px solid ${disp.color}44`,
                        display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%',
                          backgroundColor: disp.color }} />
                        {disp.label}
                      </span>
                      <span style={{ backgroundColor: `${nivel.color}22`, color: nivel.color,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '700', border: `1px solid ${nivel.color}44` }}>
                        {nivel.label}
                      </span>
                    </div>
                  </div>

                  {/* Acciones segun jerarquia: jefe edita, admin edita y elimina */}
                  {puedeGestionarRecursos && (
                    <div style={{ ...styles.cardActions, borderTop: `1px solid ${colors.border}`,
                      backgroundColor: 'var(--surface-subtle)' }}>
                      <button onClick={() => handleEdit(r)} style={styles.btnEdit}>
                        <FiEdit2 size={13} /> Editar
                      </button>
                      {puedeEliminarRecursos && (
                        <button onClick={() => handleDelete(r.id)} style={styles.btnDelete}>
                          <FiTrash2 size={13} /> Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { padding: '26px 24px 42px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '4px', letterSpacing: 0 },
  btnPrimary: {
    background: 'var(--primary)', color: 'white',
    border: '1px solid var(--primary)', padding: '10px 16px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: '0 6px 16px color-mix(in srgb, var(--primary) 20%, transparent)',
  },
  btnSuccess: {
    background: 'var(--success)', color: 'white',
    border: '1px solid var(--success)', padding: '10px 18px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '800', boxShadow: '0 6px 16px color-mix(in srgb, var(--success) 20%, transparent)',
  },
  formCard: {
    borderRadius: '8px', padding: '24px', marginBottom: '20px',
    borderTop: '3px solid var(--primary)', border: '1px solid', boxShadow: 'var(--shadow-sm)',
  },
  formTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', letterSpacing: 0 },
  input: {
    padding: '10px 12px', borderRadius: '7px', border: '1px solid',
    fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  toast: {
    border: '1px solid', borderRadius: '7px', padding: '12px 14px',
    fontSize: '14px', fontWeight: '800', marginBottom: '16px',
  },
  projectChecks: {
    border: '2px solid', borderRadius: '8px', padding: '10px 12px',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '10px', minHeight: '44px',
  },
  projectCheck: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: '600',
  },
  assignmentSection: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '12px' },
  assignmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  assignmentCard: {
    border: '1px solid', borderRadius: '8px', padding: '16px',
    boxShadow: 'var(--shadow-sm)',
  },
  projectIdBadge: {
    backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '999px',
    padding: '4px 9px', fontSize: '11px', fontWeight: '800', height: 'fit-content',
  },
  assignedPeople: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
  assignedPersonBadge: {
    backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '999px',
    padding: '5px 10px', fontSize: '12px', fontWeight: '700',
  },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px' },
  employeeCard: { borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' },
  avatar: {
    width: '44px', height: '44px', borderRadius: '8px',
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
    textAlign: 'center', padding: '64px', borderRadius: '8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};

export default Recursos;
