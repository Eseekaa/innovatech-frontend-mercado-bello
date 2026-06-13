import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';
import { proyectosService, recursosService, tareasService } from '../services/api';
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';

const estadoOptions = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'BLOQUEADA'];
const prioridadOptions = ['BAJA', 'MEDIA', 'ALTA'];
const estadoLabels = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
  BLOQUEADA: 'Bloqueada',
};

const initialForm = {
  proyectoId: '',
  titulo: '',
  descripcion: '',
  estado: 'PENDIENTE',
  avance: 0,
  prioridad: 'MEDIA',
  fechaInicio: '',
  fechaFin: '',
  responsableIds: [],
};

function Tareas() {
  const { darkMode } = useTheme();
  const rol = localStorage.getItem('rol') || 'USUARIO';
  const canManage = rol === 'ADMIN' || rol === 'JEFE_PROYECTO';
  const puedeAprobarTareas = rol === 'ADMIN' || rol === 'JEFE_PROYECTO';

  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [filtros, setFiltros] = useState({ busqueda: '', proyectoId: '', estado: '' });
  // El formulario parte oculto para que la pantalla primero muestre el resumen.
  // Se abre solo cuando el usuario presiona "Nueva Tarea" o edita una tarea.
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    bg: darkMode ? '#0f172a' : '#f0f2f5',
    card: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#111827' : '#ffffff',
    tableHead: darkMode ? '#111827' : '#f8fafc',
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setActualizando(true);
      setError('');
      const [tareasRes, proyectosRes, recursosRes, kpisRes] = await Promise.all([
        tareasService.getAll(),
        proyectosService.getAll(),
        recursosService.getAll(),
        tareasService.getKpis(),
      ]);
      setTareas(tareasRes.data || []);
      setProyectos(proyectosRes.data || []);
      setRecursos(recursosRes.data || []);
      setKpis(kpisRes.data || null);
    } catch (err) {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };

      // Regla visual: si el usuario marca una tarea como completada,
      // el avance se lleva a 100%. Si la bloquea, no puede quedar al 100%
      // porque una tarea bloqueada representa un impedimento pendiente.
      if (name === 'estado' && value === 'COMPLETADA') {
        next.avance = 100;
      }
      if (name === 'estado' && value === 'BLOQUEADA' && Number(prev.avance) >= 100) {
        next.avance = 99;
      }

      return next;
    });
  };

  const toggleResponsable = (id) => {
    const idNumerico = Number(id);
    setForm(prev => {
      const existe = prev.responsableIds.includes(idNumerico);
      return {
        ...prev,
        responsableIds: existe
          ? prev.responsableIds.filter(item => item !== idNumerico)
          : [...prev.responsableIds, idNumerico],
      };
    });
  };

  const abrirNuevaTarea = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const abrirEdicion = (tarea) => {
    setEditing(tarea);
    setShowForm(true);
    setForm({
      proyectoId: tarea.proyectoId || '',
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || '',
      estado: tarea.estado || 'PENDIENTE',
      avance: tarea.avance ?? 0,
      prioridad: tarea.prioridad || 'MEDIA',
      fechaInicio: tarea.fechaInicio || '',
      fechaFin: tarea.fechaFin || '',
      responsableIds: Array.isArray(tarea.responsableIds) ? tarea.responsableIds.map(Number) : [],
    });
  };

  const cancelarFormulario = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(false);
  };

  const guardarTarea = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        proyectoId: Number(form.proyectoId),
        avance: Number(form.avance),
        fechaInicio: form.fechaInicio || null,
        fechaFin: form.fechaFin || null,
      };

      if (!editing && !canManage) {
        return;
      }

      if (editing && !canManage) {
        // Un usuario operativo solo reporta avance/estado.
        await tareasService.updateEstado(editing.id, {
          estado: payload.estado,
          avance: payload.avance,
        });
      } else if (editing) {
        await tareasService.update(editing.id, payload);
      } else {
        await tareasService.create(payload);
      }

      await cargarDatos();
      cancelarFormulario();
    } catch (err) {
      setError('No se pudo guardar la tarea. Revisa los campos obligatorios.');
    }
  };

  const eliminarTarea = async (id) => {
    if (!canManage) return;
    if (!window.confirm('¿Eliminar esta tarea?')) return;

    try {
      await tareasService.delete(id);
      await cargarDatos();
    } catch (err) {
      setError('No se pudo eliminar la tarea.');
    }
  };

  const cambiarVistoBueno = async (tarea) => {
    if (!puedeAprobarTareas) return;

    // Regla de negocio: solo se aprueba formalmente algo que ya esta completado.
    // Si cambia a pendiente/en progreso/bloqueada, el backend quita el visto bueno.
    if (tarea.estado !== 'COMPLETADA') {
      setError('Solo se puede dar visto bueno a tareas completadas.');
      return;
    }

    try {
      await tareasService.updateVistoBueno(tarea.id, !tarea.vistoBueno);
      await cargarDatos();
    } catch (err) {
      setError('No se pudo actualizar el visto bueno de la tarea.');
    }
  };

  const nombreProyecto = (id) => {
    const proyecto = proyectos.find(item => String(item.id) === String(id));
    return proyecto ? proyecto.nombre : `Proyecto ${id}`;
  };

  const nombreRecurso = (id) => {
    const recurso = recursos.find(item => String(item.id) === String(id));
    return recurso ? `${recurso.nombre} ${recurso.apellido}` : `Empleado ${id}`;
  };

  const estadoColor = (estado) => ({
    PENDIENTE: '#f59e0b',
    EN_PROGRESO: '#3b82f6',
    COMPLETADA: '#22c55e',
    BLOQUEADA: '#ef4444',
  }[estado] || '#64748b');

  const validarVistoBueno = (tarea) => {
    if (tarea.estado !== 'COMPLETADA') {
      return { label: 'No aplica', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.16)' };
    }
    if (tarea.vistoBueno) {
      return { label: 'Aprobada', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.16)' };
    }
    return { label: 'Pendiente VB', color: '#d97706', bg: 'rgba(245, 158, 11, 0.18)' };
  };

  const busquedaFiltro = filtros.busqueda.trim().toLowerCase();

  // Los filtros se aplican en memoria porque la cantidad de tareas de la demo es pequena.
  // En una aplicacion productiva grande, estos filtros podrian enviarse al backend.
  const tareasFiltradas = tareas.filter((tarea) => {
    const proyecto = nombreProyecto(tarea.proyectoId).toLowerCase();
    const responsables = (tarea.responsableIds || [])
      .map(id => nombreRecurso(id).toLowerCase())
      .join(' ');
    const texto = [
      tarea.titulo,
      tarea.descripcion,
      tarea.estado,
      tarea.prioridad,
      proyecto,
      responsables,
    ].join(' ').toLowerCase();

    const coincideBusqueda = !busquedaFiltro || texto.includes(busquedaFiltro);
    const coincideProyecto = !filtros.proyectoId || String(tarea.proyectoId) === String(filtros.proyectoId);
    const coincideEstado = !filtros.estado || tarea.estado === filtros.estado;

    return coincideBusqueda && coincideProyecto && coincideEstado;
  });

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', proyectoId: '', estado: '' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
        <Navbar />
        <div style={styles.center}>Cargando tareas...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <main style={styles.container}>
        <section style={{ ...styles.hero, backgroundColor: colors.card, borderColor: colors.border }}>
          <div style={styles.heroContent}>
            <h1 style={{ ...styles.title, color: colors.text }}>Gestion de Tareas</h1>
            <p style={{ ...styles.subtitle, color: colors.subtext }}>
              Monitorea tareas por proyecto, responsables, avance, prioridad y estado operativo.
            </p>
          </div>
          <div style={styles.heroActions}>
            <button onClick={cargarDatos} disabled={actualizando} style={{ ...styles.refreshButton, opacity: actualizando ? 0.75 : 1 }}>
              <FiRefreshCw size={15} /> {actualizando ? 'Actualizando...' : 'Actualizar'}
            </button>
            {canManage && (
              <button onClick={abrirNuevaTarea} style={styles.primaryButton}>
                <FiPlus size={16} /> Nueva Tarea
              </button>
            )}
          </div>
        </section>

        <section style={styles.header}>
          <div>
            <h2 style={{ ...styles.sectionTitle, color: colors.text }}>Resumen operativo</h2>
            <p style={{ ...styles.subtitle, color: colors.subtext }}>Indicadores principales del trabajo planificado.</p>
          </div>
        </section>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.kpiGrid}>
          <KpiCard icon={<FiActivity />} label="Total tareas" value={kpis?.totalTareas || 0} color="#6366f1" colors={colors} />
          <KpiCard icon={<FiClock />} label="En progreso" value={kpis?.tareasEnProgreso || 0} color="#3b82f6" colors={colors} />
          <KpiCard icon={<FiCheckCircle />} label="Completadas" value={kpis?.tareasCompletadas || 0} color="#22c55e" colors={colors} />
          <KpiCard icon={<FiCheckCircle />} label="Aprobadas" value={kpis?.tareasAprobadas || 0} color="#14b8a6" colors={colors} />
          <KpiCard icon={<FiXCircle />} label="Pend. visto bueno" value={kpis?.tareasPendientesAprobacion || 0} color="#f59e0b" colors={colors} />
          <KpiCard icon={<FiActivity />} label="Avance promedio" value={`${kpis?.avancePromedio || 0}%`} color="#f59e0b" colors={colors} />
        </section>

        <section style={{ ...styles.filterPanel, backgroundColor: colors.card, borderColor: colors.border }}>
          <div style={styles.filterTitle}>
            <FiFilter size={16} />
            <span>Filtros de monitoreo</span>
          </div>
          <div style={styles.filterGrid}>
            <label style={{ ...styles.searchBox, borderColor: colors.border, backgroundColor: colors.input }}>
              <FiSearch size={16} color={colors.subtext} />
              <input
                value={filtros.busqueda}
                onChange={(event) => setFiltros(prev => ({ ...prev, busqueda: event.target.value }))}
                placeholder="Buscar por tarea, proyecto o responsable"
                style={{ ...styles.searchInput, color: colors.text }}
              />
            </label>
            <select
              value={filtros.proyectoId}
              onChange={(event) => setFiltros(prev => ({ ...prev, proyectoId: event.target.value }))}
              style={inputStyle(colors)}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
              ))}
            </select>
            <select
              value={filtros.estado}
              onChange={(event) => setFiltros(prev => ({ ...prev, estado: event.target.value }))}
              style={inputStyle(colors)}
            >
              <option value="">Todos los estados</option>
              {estadoOptions.map(estado => <option key={estado} value={estado}>{estadoLabels[estado]}</option>)}
            </select>
            <button type="button" onClick={limpiarFiltros} style={styles.secondaryButton}>Limpiar</button>
          </div>
        </section>

        {showForm && (
          <section style={{ ...styles.panel, backgroundColor: colors.card, borderColor: colors.border }}>
            <h2 style={{ ...styles.panelTitle, color: colors.text }}>
              {editing ? (canManage ? 'Editar tarea' : 'Reportar avance') : 'Nueva tarea'}
            </h2>
            <form onSubmit={guardarTarea} style={styles.formGrid}>
              <Field label="Proyecto" colors={colors}>
                <select name="proyectoId" value={form.proyectoId} onChange={handleChange} required disabled={editing && !canManage} style={inputStyle(colors)}>
                  <option value="">Selecciona proyecto</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
                  ))}
                </select>
              </Field>

              <Field label="Titulo" colors={colors}>
                <input name="titulo" value={form.titulo} onChange={handleChange} required disabled={editing && !canManage} style={inputStyle(colors)} />
              </Field>

              <Field label="Estado" colors={colors}>
                <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle(colors)}>
                  {estadoOptions.map(estado => <option key={estado} value={estado}>{estadoLabels[estado]}</option>)}
                </select>
              </Field>

              <Field label="Avance (%)" colors={colors}>
                <input name="avance" type="number" min="0" max="100" value={form.avance} onChange={handleChange} style={inputStyle(colors)} />
              </Field>

              <Field label="Prioridad" colors={colors}>
                <select name="prioridad" value={form.prioridad} onChange={handleChange} disabled={editing && !canManage} style={inputStyle(colors)}>
                  {prioridadOptions.map(prioridad => <option key={prioridad} value={prioridad}>{prioridad}</option>)}
                </select>
              </Field>

              <Field label="Fecha inicio" colors={colors}>
                <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} disabled={editing && !canManage} style={inputStyle(colors)} />
              </Field>

              <Field label="Fecha fin" colors={colors}>
                <input name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} disabled={editing && !canManage} style={inputStyle(colors)} />
              </Field>

              <Field label="Descripcion" colors={colors} wide>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required disabled={editing && !canManage} style={{ ...inputStyle(colors), minHeight: '84px', resize: 'vertical' }} />
              </Field>

              <div style={{ ...styles.responsablesBox, borderColor: colors.border, gridColumn: '1 / -1' }}>
                <div style={{ ...styles.label, color: colors.subtext }}>Responsables</div>
                <div style={styles.responsablesGrid}>
                  {recursos.length === 0 ? (
                    <span style={{ color: colors.subtext }}>No hay empleados registrados.</span>
                  ) : recursos.map(recurso => (
                    <label key={recurso.id} style={{ ...styles.checkboxItem, color: colors.text }}>
                      <input
                        type="checkbox"
                        checked={form.responsableIds.includes(Number(recurso.id))}
                        onChange={() => toggleResponsable(recurso.id)}
                        disabled={editing && !canManage}
                      />
                      {recurso.nombre} {recurso.apellido}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={cancelarFormulario} style={styles.secondaryButton}>Cancelar</button>
                <button type="submit" style={styles.saveButton}><FiSave size={16} /> Guardar</button>
              </div>
            </form>
          </section>
        )}

        <section style={{ ...styles.panel, backgroundColor: colors.card, borderColor: colors.border }}>
          <div style={styles.panelHeader}>
            <h2 style={{ ...styles.panelTitle, color: colors.text }}>Tareas registradas</h2>
            <span style={{ color: colors.subtext }}>{tareasFiltradas.length} de {tareas.length} tarea(s)</span>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Tarea', 'Proyecto', 'Responsables', 'Estado', 'Avance', 'Prioridad', 'Cierre', 'Acciones'].map(head => (
                    <th key={head} style={{ ...styles.th, backgroundColor: colors.tableHead, color: colors.subtext }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tareasFiltradas.length === 0 ? (
                  <tr><td colSpan="8" style={{ ...styles.empty, color: colors.subtext }}>No hay tareas que coincidan con los filtros.</td></tr>
                ) : tareasFiltradas.map(tarea => (
                  <tr key={tarea.id}>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>
                      <strong>{tarea.titulo}</strong>
                      <span style={{ ...styles.description, color: colors.subtext }}>{tarea.descripcion}</span>
                    </td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{nombreProyecto(tarea.proyectoId)}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <div style={styles.badgeList}>
                        {(tarea.responsableIds || []).length === 0
                          ? <span style={{ color: colors.subtext }}>Sin asignar</span>
                          : tarea.responsableIds.map(id => (
                            <span key={id} style={{ ...styles.personBadge, borderColor: colors.border, color: colors.text }}>
                              <FiUsers size={12} /> {nombreRecurso(id)}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <span style={{ ...styles.statusBadge, backgroundColor: `${estadoColor(tarea.estado)}22`, color: estadoColor(tarea.estado), borderColor: estadoColor(tarea.estado) }}>
                        {estadoLabels[tarea.estado] || tarea.estado}
                      </span>
                    </td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <Progress value={tarea.avance || 0} color={estadoColor(tarea.estado)} />
                    </td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{tarea.prioridad}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <div style={styles.validationCell}>
                        <span style={{
                          ...styles.validationBadge,
                          color: validarVistoBueno(tarea).color,
                          backgroundColor: validarVistoBueno(tarea).bg,
                        }}>
                          {validarVistoBueno(tarea).label}
                        </span>
                        {puedeAprobarTareas && tarea.estado === 'COMPLETADA' && (
                          <button
                            type="button"
                            onClick={() => cambiarVistoBueno(tarea)}
                            style={tarea.vistoBueno ? styles.unapproveButton : styles.approveButton}
                          >
                            {tarea.vistoBueno ? 'Quitar VB' : 'Dar VB'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <div style={styles.actions}>
                        <button onClick={() => abrirEdicion(tarea)} style={styles.iconButton} title={canManage ? 'Editar tarea' : 'Reportar avance'}>
                          <FiEdit2 size={15} />
                        </button>
                        {canManage && (
                          <button onClick={() => eliminarTarea(tarea.id)} style={styles.dangerButton} title="Eliminar tarea">
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, colors, children, wide }) {
  return (
    <label style={{ ...styles.field, gridColumn: wide ? '1 / -1' : undefined }}>
      <span style={{ ...styles.label, color: colors.subtext }}>{label}</span>
      {children}
    </label>
  );
}

function KpiCard({ icon, label, value, color, colors }) {
  return (
    <div style={{ ...styles.kpiCard, backgroundColor: colors.card, borderColor: colors.border }}>
      <div style={{ ...styles.kpiIcon, color, backgroundColor: `${color}18` }}>{icon}</div>
      <div>
        <div style={{ ...styles.kpiValue, color }}>{value}</div>
        <div style={{ color: colors.subtext, fontSize: '13px' }}>{label}</div>
      </div>
    </div>
  );
}

function Progress({ value, color }) {
  return (
    <div style={styles.progressWrap}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700 }}>{value}%</span>
    </div>
  );
}

function inputStyle(colors) {
  return {
    width: '100%',
    padding: '11px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.input,
    color: colors.text,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };
}

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '28px 24px 40px' },
  center: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  hero: {
    border: '1px solid',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.18)',
  },
  heroContent: { maxWidth: '720px' },
  heroActions: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  eyebrow: {
    display: 'inline-flex',
    marginBottom: '8px',
    padding: '5px 10px',
    borderRadius: '999px',
    background: 'rgba(59, 130, 246, 0.16)',
    color: '#60a5fa',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' },
  title: { margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: 0 },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 900 },
  subtitle: { margin: '6px 0 0', fontSize: '14px', lineHeight: 1.5 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '18px' },
  kpiCard: { border: '1px solid', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)' },
  kpiIcon: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: '24px', fontWeight: 900, lineHeight: 1 },
  filterPanel: { border: '1px solid', borderRadius: '14px', padding: '16px', marginBottom: '18px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)' },
  filterTitle: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#60a5fa', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '42px', border: '1px solid', borderRadius: '10px', padding: '0 12px' },
  searchInput: { flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: '14px', minWidth: 0 },
  panel: { border: '1px solid', borderRadius: '14px', padding: '18px', marginBottom: '18px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  panelTitle: { margin: 0, fontSize: '18px', fontWeight: 800 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' },
  responsablesBox: { border: '1px solid', borderRadius: '10px', padding: '12px' },
  responsablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '8px' },
  checkboxItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  formActions: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', border: 0, borderRadius: '10px', padding: '11px 16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 12px 26px rgba(37, 99, 235, 0.30)' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.35)', borderRadius: '10px', padding: '10px 14px', backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#dbeafe', fontWeight: 800, cursor: 'pointer' },
  secondaryButton: { border: '1px solid #cbd5e1', borderRadius: '9px', padding: '10px 14px', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 800, cursor: 'pointer' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', border: 0, borderRadius: '8px', padding: '10px 14px', backgroundColor: '#16a34a', color: 'white', fontWeight: 800, cursor: 'pointer' },
  tableWrap: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '980px' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  td: { padding: '12px', borderTop: '1px solid', verticalAlign: 'middle', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '28px' },
  description: { display: 'block', marginTop: '4px', fontSize: '12px' },
  badgeList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  personBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid', borderRadius: '999px', padding: '5px 8px', fontSize: '12px', fontWeight: 700 },
  statusBadge: { border: '1px solid', borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap' },
  validationCell: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  validationBadge: { borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap' },
  approveButton: { border: 0, borderRadius: '8px', padding: '7px 9px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 900, cursor: 'pointer' },
  unapproveButton: { border: 0, borderRadius: '8px', padding: '7px 9px', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: 900, cursor: 'pointer' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' },
  progressTrack: { flex: 1, height: '8px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px' },
  actions: { display: 'flex', gap: '8px' },
  iconButton: { width: '34px', height: '34px', border: 0, borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', cursor: 'pointer' },
  dangerButton: { width: '34px', height: '34px', border: 0, borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer' },
  error: { marginBottom: '14px', padding: '12px 14px', borderRadius: '9px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 },
};

export default Tareas;
