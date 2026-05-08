import React, { useState, useEffect } from 'react';
import { proyectosService, recursosService } from '../services/api';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    estado: 'ACTIVO',
    responsable: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const { darkMode } = useTheme();
  const rol = localStorage.getItem('rol');
  const esAdmin = rol === 'ADMIN';
  const esJefe = rol === 'JEFE_PROYECTO';
  const esUsuario = rol === 'USUARIO';

  // Jerarquia de permisos:
  // USUARIO: revisa proyectos y puede dar/quitar visto bueno.
  // JEFE_PROYECTO: hereda lo del usuario y ademas crea/edita proyectos.
  // ADMIN: hereda todo y ademas puede eliminar proyectos.
  const puedeCambiarVistoBueno = esUsuario || esJefe || esAdmin;
  const puedeGestionarProyecto = esJefe || esAdmin;
  const puedeEliminarProyecto = esAdmin;
  const muestraAcciones = puedeCambiarVistoBueno || puedeGestionarProyecto || puedeEliminarProyecto;

  const colors = {
    bg: darkMode ? '#0f172a' : '#f0f2f5',
    card: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#0f172a' : 'white',
    inputText: darkMode ? '#f1f5f9' : '#0f172a',
    th: darkMode ? '#0f172a' : '#f8f9ff',
    thText: darkMode ? '#94a3b8' : '#888',
  };

  useEffect(() => {
    fetchProyectos();
    fetchRecursos();
  }, []);

  const mostrarMensaje = (tipo, texto) => {
    // Mensaje temporal para que el usuario vea que la accion se completo.
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 2800);
  };

  const fetchProyectos = async () => {
    const response = await proyectosService.getAll();
    setProyectos(response.data);
  };

  const fetchRecursos = async () => {
    const response = await recursosService.getAll();
    setRecursos(response.data);
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: '',
      descripcion: '',
      estado: 'ACTIVO',
      responsable: '',
      fechaInicio: '',
      fechaFin: '',
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await proyectosService.update(editId, form);
        mostrarMensaje('success', 'Proyecto actualizado correctamente.');
      } else {
        await proyectosService.create(form);
        mostrarMensaje('success', 'Proyecto creado correctamente.');
      }
      limpiarFormulario();
      setEditId(null);
      setShowForm(false);
      fetchProyectos();
    } catch (err) {
      mostrarMensaje('error', 'No se pudo guardar el proyecto.');
    }
  };

  const handleEdit = (proyecto) => {
    setForm({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      estado: proyecto.estado,
      responsable: proyecto.responsable,
      fechaInicio: proyecto.fechaInicio || '',
      fechaFin: proyecto.fechaFin || '',
    });
    setEditId(proyecto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar este proyecto?')) {
      try {
        await proyectosService.delete(id);
        mostrarMensaje('success', 'Proyecto eliminado correctamente.');
        fetchProyectos();
      } catch (err) {
        mostrarMensaje('error', 'No se pudo eliminar el proyecto.');
      }
    }
  };

  const handleCambiarVistoBueno = async (proyecto, nuevoValor) => {
    // Envia el proyecto completo con el nuevo valor de vistoBueno.
    // true  = aprobado por el usuario/administrador.
    // false = vuelve a pendiente si se quita el visto bueno.
    try {
      await proyectosService.update(proyecto.id, { ...proyecto, vistoBueno: nuevoValor });
      mostrarMensaje('success', nuevoValor ? 'Visto bueno aprobado.' : 'Visto bueno quitado.');
      fetchProyectos();
    } catch (err) {
      mostrarMensaje('error', 'No se pudo cambiar el visto bueno.');
    }
  };

  const getIdsProyectos = (recurso) => {
    // idProyectos es la nueva relacion multiple; idProyecto queda como compatibilidad.
    if (Array.isArray(recurso.idProyectos) && recurso.idProyectos.length > 0) {
      return recurso.idProyectos;
    }
    return recurso.idProyecto ? [recurso.idProyecto] : [];
  };

  const getRecursosAsignados = (idProyecto) => {
    // Compara como texto para evitar fallos si algun servicio retorna el ID como string.
    return recursos.filter(r => getIdsProyectos(r).map(String).includes(String(idProyecto)));
  };

  const estadoConfig = {
    ACTIVO: { color: '#22c55e', bg: '#f0fdf4', darkBg: '#14532d22' },
    EN_PAUSA: { color: '#f59e0b', bg: '#fffbeb', darkBg: '#78350f22' },
    COMPLETADO: { color: '#3b82f6', bg: '#eff6ff', darkBg: '#1e3a5f22' },
    CANCELADO: { color: '#ef4444', bg: '#fef2f2', darkBg: '#7f1d1d22' },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, transition: 'all 0.3s' }}>
      <Navbar />
      <div style={styles.container}>
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
        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>Gestion de Proyectos</h1>
            <p style={{ color: colors.subtext, fontSize: '14px' }}>
              {proyectos.length} proyecto(s) registrado(s)
            </p>
          </div>
          {puedeGestionarProyecto && (
            <button
              style={showForm ? {
                ...styles.btn,
                backgroundColor: colors.card,
                color: colors.subtext,
                border: `2px solid ${colors.border}`,
              } : styles.btnPrimary}
              onClick={() => {
                setShowForm(!showForm);
                setEditId(null);
                limpiarFormulario();
              }}
            >
              {showForm ? <><FiX size={16} /> Cancelar</> : <><FiPlus size={16} /> Nuevo Proyecto</>}
            </button>
          )}
        </div>

        {showForm && puedeGestionarProyecto && (
          <div style={{ ...styles.formCard, backgroundColor: colors.card, borderColor: colors.border }}>
            <h3 style={{ ...styles.formTitle, color: colors.text }}>
              {editId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {[
                  { name: 'nombre', label: 'Nombre *', placeholder: 'Nombre del proyecto', span: 1 },
                  { name: 'responsable', label: 'Responsable *', placeholder: 'Responsable', span: 1 },
                ].map(f => (
                  <div key={f.name} style={{ ...styles.field, gridColumn: `span ${f.span}` }}>
                    <label style={{ ...styles.label, color: colors.subtext }}>{f.label}</label>
                    <input
                      name={f.name}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={handleChange}
                      required
                      style={{ ...styles.input, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.border }}
                    />
                  </div>
                ))}
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.border }}>
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_PAUSA">En Pausa</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Fecha Inicio</label>
                  <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.border }} />
                </div>
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Fecha Fin</label>
                  <input name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange}
                    style={{ ...styles.input, backgroundColor: colors.input, color: colors.inputText, borderColor: colors.border }} />
                </div>
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={{ ...styles.label, color: colors.subtext }}>Descripcion *</label>
                  <textarea name="descripcion" placeholder="Describe el proyecto..." value={form.descripcion}
                    onChange={handleChange} required style={{ ...styles.input, height: '80px',
                      resize: 'vertical', backgroundColor: colors.input, color: colors.inputText, borderColor: colors.border }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" style={styles.btnSuccess}>
                  {editId ? 'Actualizar' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ ...styles.tableCard, backgroundColor: colors.card, borderColor: colors.border }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Proyecto', 'Estado', 'Responsable', 'Empleados asignados', 'Visto bueno', 'Fecha Inicio', 'Fecha Fin',
                  ...(muestraAcciones ? ['Acciones'] : [])].map(h => (
                  <th key={h} style={{ ...styles.th, backgroundColor: colors.th, color: colors.thText }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyectos.length === 0 ? (
                <tr>
                  <td colSpan={muestraAcciones ? 8 : 7} style={{ ...styles.empty, color: colors.subtext }}>
                    Sin proyectos registrados
                  </td>
                </tr>
              ) : proyectos.map(p => {
                const cfg = estadoConfig[p.estado] || {};
                const asignados = getRecursosAsignados(p.id);
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <div style={{ fontWeight: '700', color: colors.text, marginBottom: '2px' }}>{p.nombre}</div>
                      <div style={{ fontSize: '12px', color: colors.subtext, maxWidth: '200px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.descripcion}
                      </div>
                    </td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <span style={{ backgroundColor: darkMode ? cfg.darkBg : cfg.bg,
                        color: cfg.color, padding: '5px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '700', border: `1px solid ${cfg.color}44` }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>{p.responsable}</td>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>
                      {asignados.length === 0 ? (
                        <span style={{ color: colors.subtext }}>Sin empleados</span>
                      ) : (
                        <div style={styles.assignedList}>
                          {asignados.map(r => (
                            <span key={r.id} style={{ ...styles.assignedBadge, borderColor: colors.border }}>
                              {r.nombre} {r.apellido}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <span style={p.vistoBueno ? styles.badgeApproved : styles.badgePending}>
                        {p.vistoBueno ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{p.fechaInicio || '-'}</td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{p.fechaFin || '-'}</td>
                    {muestraAcciones && (
                      <td style={{ ...styles.td, borderColor: colors.border }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {puedeGestionarProyecto && (
                            <button onClick={() => handleEdit(p)} style={styles.btnEdit}>
                              <FiEdit2 size={13} /> Editar
                            </button>
                          )}
                          {puedeEliminarProyecto && (
                            <button onClick={() => handleDelete(p.id)} style={styles.btnDelete}>
                              <FiTrash2 size={13} />
                            </button>
                          )}
                          {puedeCambiarVistoBueno && (
                            p.vistoBueno ? (
                              <button onClick={() => handleCambiarVistoBueno(p, false)} style={styles.btnRemoveApproval}>
                                <FiXCircle size={13} /> Quitar visto bueno
                              </button>
                            ) : (
                              <button onClick={() => handleCambiarVistoBueno(p, true)} style={styles.btnApprove}>
                                <FiCheckCircle size={13} /> Dar visto bueno
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  btn: { padding: '11px 20px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
  btnPrimary: {
    background: 'linear-gradient(135deg, #1a237e, #1565c0)',
    color: 'white', border: 'none', padding: '11px 20px',
    borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: '0 4px 15px rgba(26,35,126,0.3)',
  },
  btnSuccess: {
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: 'white', border: 'none', padding: '11px 24px',
    borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 15px rgba(22,163,74,0.3)',
  },
  formCard: {
    borderRadius: '16px', padding: '28px', marginBottom: '24px',
    borderTop: '4px solid #1a237e', border: '1px solid',
  },
  formTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  input: {
    padding: '10px 14px', borderRadius: '8px', border: '2px solid',
    fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  toast: {
    border: '1px solid', borderRadius: '10px', padding: '12px 14px',
    fontSize: '14px', fontWeight: '800', marginBottom: '16px',
  },
  tableCard: { borderRadius: '16px', overflowX: 'auto', overflowY: 'hidden', border: '1px solid' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1050px' },
  th: { padding: '13px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '14px 16px', fontSize: '14px' },
  assignedList: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  assignedBadge: {
    padding: '4px 8px', borderRadius: '7px', border: '1px solid',
    fontSize: '12px', fontWeight: '600',
  },
  badgeApproved: {
    backgroundColor: '#dcfce7', color: '#15803d', padding: '5px 10px',
    borderRadius: '20px', fontSize: '12px', fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#fef3c7', color: '#b45309', padding: '5px 10px',
    borderRadius: '20px', fontSize: '12px', fontWeight: '700',
  },
  btnEdit: {
    backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none',
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
  },
  btnDelete: {
    backgroundColor: '#fef2f2', color: '#dc2626', border: 'none',
    padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '12px', display: 'flex', alignItems: 'center',
  },
  btnApprove: {
    backgroundColor: '#dcfce7', color: '#15803d', border: 'none',
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
  },
  btnRemoveApproval: {
    backgroundColor: '#fef3c7', color: '#b45309', border: 'none',
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
  },
  empty: { textAlign: 'center', padding: '48px', fontSize: '15px' },
};

export default Proyectos;
