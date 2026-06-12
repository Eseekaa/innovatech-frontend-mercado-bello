import React, { useState, useEffect } from 'react';
import { dashboardService, tareasService } from '../services/api';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';
import { FiFolder, FiUsers, FiTrendingUp, FiClock, FiShield } from 'react-icons/fi';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [kpisPorProyecto, setKpisPorProyecto] = useState([]);
  const [kpisPorResponsable, setKpisPorResponsable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { darkMode } = useTheme(); // Lee el tema global
  const username = localStorage.getItem('username') || 'usuario';
  const rol = localStorage.getItem('rol') || 'USUARIO';

  // Colores según tema
  const colors = {
    bg: darkMode ? '#0f172a' : '#f0f2f5',
    card: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#f0f0f0',
    tableHead: darkMode ? '#0f172a' : '#f8f9ff',
    tableHeadText: darkMode ? '#94a3b8' : '#888',
    row: darkMode ? '#1e293b' : 'white',
    rowHover: darkMode ? '#273344' : '#f8fafc',
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Carga principal del dashboard y reportes EV3 en paralelo.
        // Promise.all permite que las tres peticiones salgan al mismo tiempo.
        const [dashboardResponse, proyectosKpiResponse, responsablesKpiResponse] = await Promise.all([
          dashboardService.getDashboard(),
          tareasService.getKpisPorProyecto(),
          tareasService.getKpisPorResponsable(),
        ]);
        setDashboard(dashboardResponse.data);
        setKpisPorProyecto(proyectosKpiResponse.data || []);
        setKpisPorResponsable(responsablesKpiResponse.data || []);
      } catch (err) {
        setError('Error al cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <div style={styles.centerScreen}>
        <div style={styles.spinner}>⏳</div>
        <p style={{ color: colors.subtext, fontSize: '16px' }}>Cargando dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <div style={styles.centerScreen}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
      </div>
    </div>
  );

  const proyectosActivos = dashboard.proyectos.filter(p => p.estado === 'ACTIVO').length;
  const proyectosEnPausa = dashboard.proyectos.filter(p => p.estado === 'EN_PAUSA').length;
  const proyectosCompletados = dashboard.proyectos.filter(p => p.estado === 'COMPLETADO').length;
  const proyectosCancelados = dashboard.proyectos.filter(p => p.estado === 'CANCELADO').length;
  const recursosDisponibles = dashboard.recursos.filter(r => r.disponibilidad === 'DISPONIBLE').length;
  const recursosOcupados = dashboard.recursos.filter(r => r.disponibilidad === 'OCUPADO').length;
  const recursosVacaciones = dashboard.recursos.filter(r => r.disponibilidad === 'VACACIONES').length;
  const junior = dashboard.recursos.filter(r => r.nivelExperiencia === 'JUNIOR').length;
  const semiSenior = dashboard.recursos.filter(r => r.nivelExperiencia === 'SEMI_SENIOR').length;
  const senior = dashboard.recursos.filter(r => r.nivelExperiencia === 'SENIOR').length;
  // tareaKpis viene desde el BFF. Si ms-tareas esta vacio o no responde,
  // usamos valores en 0 para que el dashboard no se caiga durante la demo.
  const tareaKpis = dashboard.tareaKpis || {};
  const totalTareas = tareaKpis.totalTareas || 0;
  const tareasPendientes = tareaKpis.tareasPendientes || 0;
  const tareasEnProgreso = tareaKpis.tareasEnProgreso || 0;
  const tareasCompletadas = tareaKpis.tareasCompletadas || 0;
  const tareasBloqueadas = tareaKpis.tareasBloqueadas || 0;
  const tareasVencidas = tareaKpis.tareasVencidas || 0;
  const avancePromedio = tareaKpis.avancePromedio || 0;
  const rolInfo = getRolInfo(rol);
  const proyectosPorId = new Map(dashboard.proyectos.map(proyecto => [Number(proyecto.id), proyecto]));
  const recursosPorId = new Map(dashboard.recursos.map(recurso => [Number(recurso.id), recurso]));

  const getIdsProyectos = (recurso) => {
    // idProyectos es la relacion multiple; idProyecto queda como respaldo antiguo.
    if (Array.isArray(recurso.idProyectos) && recurso.idProyectos.length > 0) {
      return recurso.idProyectos;
    }
    return recurso.idProyecto ? [recurso.idProyecto] : [];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, transition: 'all 0.3s' }}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>Dashboard</h1>
            <p style={{ color: colors.subtext, fontSize: '15px' }}>
              Resumen general de Innovatech Solutions
            </p>
          </div>
          <div style={{ ...styles.dateBox, backgroundColor: colors.card, color: colors.subtext, border: `1px solid ${colors.border}` }}>
            📅 {new Date().toLocaleDateString('es-CL', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Franja visible para explicar el rol activo durante la presentacion */}
        <div style={{ ...styles.rolePanel, backgroundColor: colors.card, borderColor: colors.border }}>
          <div style={{ ...styles.roleIcon, backgroundColor: `${rolInfo.color}22`, color: rolInfo.color }}>
            <FiShield size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.roleTitle, color: colors.text }}>
              Sesion activa: {username} | Rol: {rolInfo.label}
            </div>
            <div style={{ ...styles.permissionList, color: colors.subtext }}>
              {rolInfo.permisos.join(' | ')}
            </div>
          </div>
        </div>

        {/* KPIs principales */}
        <div style={styles.kpiGrid}>
          <KpiCard icon={<FiFolder size={24} />} label="Total Proyectos"
            value={dashboard.totalProyectos} color="#6366f1" darkMode={darkMode} />
          <KpiCard icon={<FiClock size={24} />} label="Total Tareas"
            value={totalTareas} color="#8b5cf6" darkMode={darkMode} />
          <KpiCard icon={<FiTrendingUp size={24} />} label="Proyectos Activos"
            value={proyectosActivos} color="#22c55e" darkMode={darkMode} />
          <KpiCard icon={<FiUsers size={24} />} label="Total Empleados"
            value={dashboard.totalRecursos} color="#3b82f6" darkMode={darkMode} />
          <KpiCard icon={<FiClock size={24} />} label="Disponibles"
            value={recursosDisponibles} color="#f59e0b" darkMode={darkMode} />
        </div>

        {/* Proyectos por estado */}
        <SectionTitle title="📋 Estado de Proyectos" total={dashboard.totalProyectos} colors={colors} />
        <div style={styles.grid4}>
          <StatCard label="Activos" value={proyectosActivos} color="#22c55e" bg={darkMode ? '#14532d22' : '#f0fdf4'} darkMode={darkMode} />
          <StatCard label="En Pausa" value={proyectosEnPausa} color="#f59e0b" bg={darkMode ? '#78350f22' : '#fffbeb'} darkMode={darkMode} />
          <StatCard label="Completados" value={proyectosCompletados} color="#3b82f6" bg={darkMode ? '#1e3a5f22' : '#eff6ff'} darkMode={darkMode} />
          <StatCard label="Cancelados" value={proyectosCancelados} color="#ef4444" bg={darkMode ? '#7f1d1d22' : '#fef2f2'} darkMode={darkMode} />
        </div>

        {/* KPIs de tareas para EV3: muestran avance real del trabajo operativo */}
        <SectionTitle title="Monitoreo de Tareas" total={totalTareas} colors={colors} />
        <div style={styles.grid4}>
          <StatCard label="Pendientes" value={tareasPendientes} color="#f59e0b" bg={darkMode ? '#78350f22' : '#fffbeb'} darkMode={darkMode} />
          <StatCard label="En Progreso" value={tareasEnProgreso} color="#3b82f6" bg={darkMode ? '#1e3a5f22' : '#eff6ff'} darkMode={darkMode} />
          <StatCard label="Completadas" value={tareasCompletadas} color="#22c55e" bg={darkMode ? '#14532d22' : '#f0fdf4'} darkMode={darkMode} />
          <StatCard label="Bloqueadas" value={tareasBloqueadas} color="#ef4444" bg={darkMode ? '#7f1d1d22' : '#fef2f2'} darkMode={darkMode} />
        </div>
        <div style={styles.grid3}>
          <StatCard label="Vencidas" value={tareasVencidas} color="#ef4444" bg={darkMode ? '#7f1d1d22' : '#fef2f2'} darkMode={darkMode} />
          <StatCard label="Avance Promedio" value={`${avancePromedio}%`} color="#8b5cf6" bg={darkMode ? '#4c1d9522' : '#faf5ff'} darkMode={darkMode} />
          <StatCard label="Tareas Registradas" value={totalTareas} color="#6366f1" bg={darkMode ? '#312e8122' : '#eef2ff'} darkMode={darkMode} />
        </div>

        {/* Reportes EV3: resumen por proyecto y por responsable para defensa. */}
        <SectionTitle title="Reportes KPI por Proyecto" total={kpisPorProyecto.length} colors={colors} />
        <div style={styles.reportGrid}>
          {kpisPorProyecto.length === 0 ? (
            <EmptyReport colors={colors} text="Aun no hay tareas asociadas a proyectos." />
          ) : kpisPorProyecto.map(kpi => {
            const proyecto = proyectosPorId.get(Number(kpi.proyectoId));
            return (
              <ReportCard
                key={kpi.proyectoId}
                title={proyecto ? proyecto.nombre : `Proyecto ID ${kpi.proyectoId}`}
                subtitle={`Proyecto ${kpi.proyectoId}`}
                kpi={kpi}
                colors={colors}
                darkMode={darkMode}
              />
            );
          })}
        </div>

        <SectionTitle title="Reportes KPI por Responsable" total={kpisPorResponsable.length} colors={colors} />
        <div style={styles.reportGrid}>
          {kpisPorResponsable.length === 0 ? (
            <EmptyReport colors={colors} text="Aun no hay responsables asignados a tareas." />
          ) : kpisPorResponsable.map(kpi => {
            const recurso = recursosPorId.get(Number(kpi.responsableId));
            const nombre = recurso ? `${recurso.nombre} ${recurso.apellido}` : `Responsable ID ${kpi.responsableId}`;
            const cargo = recurso ? recurso.cargo : `Empleado ${kpi.responsableId}`;
            return (
              <ReportCard
                key={kpi.responsableId}
                title={nombre}
                subtitle={cargo}
                kpi={kpi}
                colors={colors}
                darkMode={darkMode}
              />
            );
          })}
        </div>

        {/* Recursos por disponibilidad */}
        <SectionTitle title="👥 Disponibilidad de Empleados" total={dashboard.totalRecursos} colors={colors} />
        <div style={styles.grid3}>
          <StatCard label="Disponibles" value={recursosDisponibles} color="#22c55e" bg={darkMode ? '#14532d22' : '#f0fdf4'} darkMode={darkMode} />
          <StatCard label="Ocupados" value={recursosOcupados} color="#f59e0b" bg={darkMode ? '#78350f22' : '#fffbeb'} darkMode={darkMode} />
          <StatCard label="Vacaciones" value={recursosVacaciones} color="#3b82f6" bg={darkMode ? '#1e3a5f22' : '#eff6ff'} darkMode={darkMode} />
        </div>

        {/* Nivel experiencia */}
        <SectionTitle title="🎯 Nivel de Experiencia" colors={colors} />
        <div style={styles.grid3}>
          <StatCard label="Junior" value={junior} color="#a855f7" bg={darkMode ? '#4c1d9522' : '#faf5ff'} darkMode={darkMode} />
          <StatCard label="Semi Senior" value={semiSenior} color="#6366f1" bg={darkMode ? '#312e8122' : '#eef2ff'} darkMode={darkMode} />
          <StatCard label="Senior" value={senior} color="#f59e0b" bg={darkMode ? '#78350f22' : '#fffbeb'} darkMode={darkMode} />
        </div>

        {/* Resumen ejecutivo de asignaciones proyecto -> equipo */}
        <SectionTitle title="Asignaciones de equipos" total={dashboard.proyectos.length} colors={colors} />
        <div style={styles.assignmentGrid}>
          {dashboard.proyectos.length === 0 ? (
            <div style={{ ...styles.assignmentCard, backgroundColor: colors.card, borderColor: colors.border, color: colors.subtext }}>
              Sin proyectos para relacionar.
            </div>
          ) : dashboard.proyectos.map(p => {
            const asignados = dashboard.recursos.filter(r => getIdsProyectos(r).map(String).includes(String(p.id)));
            return (
              <div key={p.id} style={{ ...styles.assignmentCard, backgroundColor: colors.card, borderColor: colors.border }}>
                <div style={{ ...styles.assignmentHeader, color: colors.text }}>
                  <span>{p.nombre}</span>
                  <span style={p.vistoBueno ? styles.miniApproved : styles.miniPending}>
                    {p.vistoBueno ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>
                <div style={{ color: colors.subtext, fontSize: '12px', marginBottom: '10px' }}>
                  Responsable: {p.responsable || 'Sin responsable'}
                </div>
                {asignados.length === 0 ? (
                  <span style={{ color: colors.subtext, fontSize: '13px' }}>Sin empleados asignados</span>
                ) : (
                  <div style={styles.assignedList}>
                    {asignados.map(r => (
                      <span key={r.id} style={{ ...styles.assignedBadge, borderColor: colors.border, color: colors.text }}>
                        {r.nombre} {r.apellido}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tablas */}
        <div style={styles.tablesGrid}>
          <TableCard title="📋 Proyectos" colors={colors}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Nombre', 'Estado', 'Responsable'].map(h => (
                    <th key={h} style={{ ...styles.th, backgroundColor: colors.tableHead, color: colors.tableHeadText }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.proyectos.length === 0 ? (
                  <tr><td colSpan="3" style={{ ...styles.empty, color: colors.subtext }}>Sin proyectos</td></tr>
                ) : dashboard.proyectos.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>{p.nombre}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <span style={{ ...styles.badge, backgroundColor:
                        p.estado === 'ACTIVO' ? '#22c55e' : p.estado === 'COMPLETADO' ? '#3b82f6' :
                        p.estado === 'CANCELADO' ? '#ef4444' : '#f59e0b' }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{p.responsable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="👥 Empleados" colors={colors}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Nombre', 'Cargo', 'Disponibilidad'].map(h => (
                    <th key={h} style={{ ...styles.th, backgroundColor: colors.tableHead, color: colors.tableHeadText }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.recursos.length === 0 ? (
                  <tr><td colSpan="3" style={{ ...styles.empty, color: colors.subtext }}>Sin empleados</td></tr>
                ) : dashboard.recursos.map(r => (
                  <tr key={r.id}>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>{r.nombre} {r.apellido}</td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{r.cargo}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <span style={{ ...styles.badge, backgroundColor:
                        r.disponibilidad === 'DISPONIBLE' ? '#22c55e' :
                        r.disponibilidad === 'VACACIONES' ? '#3b82f6' : '#f59e0b' }}>
                        {r.disponibilidad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>
      </div>
    </div>
  );
}

// Componente KPI grande para las métricas principales
function KpiCard({ icon, label, value, color, darkMode }) {
  const bg = darkMode ? '#1e293b' : 'white';
  const subColor = darkMode ? '#94a3b8' : '#64748b';
  return (
    <div style={{
      backgroundColor: bg, borderRadius: '16px', padding: '24px',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '20px',
      transition: 'all 0.3s',
    }}>
      <div style={{
        width: '56px', height: '56px', backgroundColor: `${color}22`,
        borderRadius: '14px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '32px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '14px', color: subColor, marginTop: '4px', fontWeight: '500' }}>{label}</div>
      </div>
    </div>
  );
}

// Componente tarjeta de estadística pequeña
function StatCard({ label, value, color, bg, darkMode }) {
  return (
    <div style={{
      backgroundColor: bg, borderRadius: '12px', padding: '20px', textAlign: 'center',
      border: `1px solid ${color}33`, transition: 'all 0.3s',
    }}>
      <div style={{ fontSize: '32px', fontWeight: '800', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>{label}</div>
    </div>
  );
}

// Tarjeta compacta de reporte KPI usada para proyecto y responsable.
function ReportCard({ title, subtitle, kpi, colors, darkMode }) {
  const completadas = kpi.tareasCompletadas || 0;
  const total = kpi.totalTareas || 0;
  const bloqueadas = kpi.tareasBloqueadas || 0;
  const vencidas = kpi.tareasVencidas || 0;
  const avance = kpi.avancePromedio || 0;
  const porcentaje = kpi.porcentajeCompletadas || 0;

  return (
    <div style={{ ...styles.reportCard, backgroundColor: colors.card, borderColor: colors.border }}>
      <div style={styles.reportHeader}>
        <div>
          <div style={{ ...styles.reportTitle, color: colors.text }}>{title}</div>
          <div style={{ ...styles.reportSubtitle, color: colors.subtext }}>{subtitle}</div>
        </div>
        <span style={{ ...styles.reportBadge, backgroundColor: darkMode ? '#1d4ed822' : '#eff6ff', color: '#3b82f6' }}>
          {total} tarea(s)
        </span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${Math.min(avance, 100)}%` }} />
      </div>
      <div style={{ ...styles.reportProgressText, color: colors.subtext }}>
        Avance promedio: <strong style={{ color: colors.text }}>{avance}%</strong> | Completadas: <strong style={{ color: colors.text }}>{porcentaje}%</strong>
      </div>
      <div style={styles.reportMetrics}>
        <Metric label="Completadas" value={completadas} color="#22c55e" />
        <Metric label="Bloqueadas" value={bloqueadas} color="#ef4444" />
        <Metric label="Vencidas" value={vencidas} color="#f59e0b" />
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={styles.metricBox}>
      <div style={{ color, fontWeight: 800, fontSize: '18px' }}>{value}</div>
      <div style={styles.metricLabel}>{label}</div>
    </div>
  );
}

function EmptyReport({ colors, text }) {
  return (
    <div style={{ ...styles.emptyReport, backgroundColor: colors.card, borderColor: colors.border, color: colors.subtext }}>
      {text}
    </div>
  );
}

// Componente título de sección
function SectionTitle({ title, total, colors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: '32px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>{title}</h2>
      {total !== undefined && (
        <span style={{ backgroundColor: '#6366f1', color: 'white', padding: '4px 14px',
          borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
          Total: {total}
        </span>
      )}
    </div>
  );
}

// Componente contenedor de tabla
function TableCard({ title, children, colors }) {
  return (
    <div style={{
      backgroundColor: colors.card, borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}`,
    }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
        fontSize: '15px', fontWeight: '700', color: colors.text }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function getRolInfo(rol) {
  // Texto pensado para defensa: muestra claramente que los permisos son jerarquicos.
  if (rol === 'ADMIN') {
    return {
      label: 'Administrador',
      color: '#6366f1',
      permisos: ['Gestion completa', 'Administra proyectos', 'Administra recursos', 'Aprueba proyectos'],
    };
  }
  if (rol === 'JEFE_PROYECTO') {
    return {
      label: 'Jefe de Proyecto',
      color: '#22c55e',
      permisos: ['Crea y edita proyectos', 'Asigna recursos', 'Aprueba proyectos'],
    };
  }
  return {
    label: 'Usuario',
    color: '#f59e0b',
    permisos: ['Visualiza informacion', 'Da o quita visto bueno'],
  };
}

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  centerScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '80vh', gap: '16px' },
  spinner: { fontSize: '48px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  dateBox: { padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
    fontWeight: '500', textTransform: 'capitalize' },
  rolePanel: {
    border: '1px solid', borderRadius: '14px', padding: '16px',
    display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
  },
  roleIcon: {
    width: '46px', height: '46px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  roleTitle: { fontSize: '15px', fontWeight: '800', marginBottom: '4px' },
  permissionList: { fontSize: '13px', lineHeight: 1.4 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '8px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '8px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '8px' },
  reportGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '8px' },
  reportCard: { border: '1px solid', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  reportTitle: { fontSize: '15px', fontWeight: '800', marginBottom: '4px' },
  reportSubtitle: { fontSize: '12px', fontWeight: '600' },
  reportBadge: { padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' },
  progressTrack: { width: '100%', height: '8px', borderRadius: '999px', backgroundColor: '#94a3b855', overflow: 'hidden', marginBottom: '8px' },
  progressFill: { height: '100%', borderRadius: '999px', backgroundColor: '#22c55e' },
  reportProgressText: { fontSize: '12px', marginBottom: '12px' },
  reportMetrics: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  metricBox: { borderRadius: '10px', padding: '10px', backgroundColor: 'rgba(148, 163, 184, 0.12)', textAlign: 'center' },
  metricLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' },
  emptyReport: { border: '1px solid', borderRadius: '14px', padding: '18px', fontSize: '14px' },
  assignmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '8px' },
  assignmentCard: {
    border: '1px solid', borderRadius: '14px', padding: '16px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
  },
  assignmentHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontWeight: '800', marginBottom: '6px' },
  assignedList: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  assignedBadge: { padding: '5px 9px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: '700' },
  miniApproved: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  miniPending: { backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '32px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '12px 16px', borderBottom: '1px solid', fontSize: '14px' },
  badge: { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  empty: { textAlign: 'center', padding: '32px', fontSize: '14px' },
};

export default Dashboard;
