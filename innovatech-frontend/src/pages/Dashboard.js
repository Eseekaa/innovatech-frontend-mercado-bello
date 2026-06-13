import React, { useEffect, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiBriefcase,
  FiFolder,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { dashboardService, tareasService } from '../services/api';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [kpisPorProyecto, setKpisPorProyecto] = useState([]);
  const [kpisPorResponsable, setKpisPorResponsable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username') || 'usuario';
  const rol = localStorage.getItem('rol') || 'USUARIO';

  const colors = {
    bg: 'var(--app-bg)',
    card: 'var(--surface)',
    panel: 'var(--surface-subtle)',
    text: 'var(--text-primary)',
    subtext: 'var(--text-secondary)',
    border: 'var(--border)',
    tableHead: 'var(--surface-subtle)',
    row: 'var(--surface)',
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      // El dashboard junta informacion de varios servicios:
      // dashboard general desde BFF + reportes KPI desde ms-tareas.
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

  if (loading) {
    return (
      <div className="app-page" style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
        <Navbar />
        <div style={styles.centerScreen}>Cargando dashboard...</div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="app-page" style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
        <Navbar />
        <div style={styles.centerScreen}>
          <FiAlertTriangle size={42} color="#ef4444" />
          <p style={{ color: '#ef4444', fontWeight: 800 }}>{error || 'No hay datos para mostrar.'}</p>
        </div>
      </div>
    );
  }

  const proyectos = dashboard.proyectos || [];
  const recursos = dashboard.recursos || [];
  const tareaKpis = dashboard.tareaKpis || {};
  const rolInfo = getRolInfo(rol);

  const proyectosActivos = contar(proyectos, item => item.estado === 'ACTIVO');
  const proyectosPausa = contar(proyectos, item => item.estado === 'EN_PAUSA');
  const proyectosCompletados = contar(proyectos, item => item.estado === 'COMPLETADO');
  const proyectosCancelados = contar(proyectos, item => item.estado === 'CANCELADO');
  const recursosDisponibles = contar(recursos, item => item.disponibilidad === 'DISPONIBLE');
  const recursosOcupados = contar(recursos, item => item.disponibilidad === 'OCUPADO');
  const recursosVacaciones = contar(recursos, item => item.disponibilidad === 'VACACIONES');
  const junior = contar(recursos, item => item.nivelExperiencia === 'JUNIOR');
  const semiSenior = contar(recursos, item => item.nivelExperiencia === 'SEMI_SENIOR');
  const senior = contar(recursos, item => item.nivelExperiencia === 'SENIOR');

  const totalTareas = tareaKpis.totalTareas || 0;
  const tareasPendientes = tareaKpis.tareasPendientes || 0;
  const tareasEnProgreso = tareaKpis.tareasEnProgreso || 0;
  const tareasCompletadas = tareaKpis.tareasCompletadas || 0;
  const tareasAprobadas = tareaKpis.tareasAprobadas || 0;
  const tareasPendientesAprobacion = tareaKpis.tareasPendientesAprobacion || 0;
  const tareasBloqueadas = tareaKpis.tareasBloqueadas || 0;
  const tareasVencidas = tareaKpis.tareasVencidas || 0;
  const avancePromedio = tareaKpis.avancePromedio || 0;

  const proyectosPorId = new Map(proyectos.map(proyecto => [Number(proyecto.id), proyecto]));
  const recursosPorId = new Map(recursos.map(recurso => [Number(recurso.id), recurso]));

  const getIdsProyectos = (recurso) => {
    // idProyectos es la relacion nueva de muchos proyectos por empleado.
    // idProyecto queda como compatibilidad con registros antiguos.
    if (Array.isArray(recurso.idProyectos) && recurso.idProyectos.length > 0) {
      return recurso.idProyectos;
    }
    return recurso.idProyecto ? [recurso.idProyecto] : [];
  };

  return (
    <div className="app-page" style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <main className="app-main page-enter" style={styles.container}>
        <section style={{ ...styles.hero, backgroundColor: colors.card, borderColor: colors.border }}>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>Panel Ejecutivo</h1>
            <p style={{ ...styles.subtitle, color: colors.subtext }}>
              Vista centralizada de proyectos, recursos, tareas, avance operativo y aprobaciones.
            </p>
          </div>
          <div style={styles.heroMeta}>
            <InfoPill label={rolInfo.label} value={username} color={rolInfo.color} />
            <InfoPill label="Fecha" value={new Date().toLocaleDateString('es-CL')} color="#3b82f6" />
          </div>
        </section>

        <section style={{ ...styles.rolePanel, backgroundColor: colors.card, borderColor: colors.border }}>
          <div style={{ ...styles.roleIcon, color: rolInfo.color, backgroundColor: `${rolInfo.color}20` }}>
            <FiShield size={22} />
          </div>
          <div>
            <strong style={{ color: colors.text }}>Permisos activos: {rolInfo.label}</strong>
            <p style={{ ...styles.roleText, color: colors.subtext }}>{rolInfo.permisos.join(' | ')}</p>
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard icon={<FiFolder />} label="Proyectos" value={dashboard.totalProyectos || proyectos.length} detail={`${proyectosActivos} activos`} color="var(--primary)" colors={colors} />
          <MetricCard icon={<FiUsers />} label="Empleados" value={dashboard.totalRecursos || recursos.length} detail={`${recursosDisponibles} disponibles`} color="var(--info)" colors={colors} />
          <MetricCard icon={<FiActivity />} label="Tareas" value={totalTareas} detail={`${tareasEnProgreso} en progreso`} color="var(--warning)" colors={colors} />
          <MetricCard icon={<FiTrendingUp />} label="Avance tareas" value={`${avancePromedio}%`} detail={`${tareasAprobadas} aprobadas`} color="var(--success)" colors={colors} />
        </section>

        <section style={styles.twoColumns}>
          <Panel title="Monitoreo de tareas" subtitle="Estado, avance y cierre formal" colors={colors}>
            <ProgressRow label="Pendientes" value={tareasPendientes} total={totalTareas} color="#f59e0b" colors={colors} />
            <ProgressRow label="En progreso" value={tareasEnProgreso} total={totalTareas} color="#3b82f6" colors={colors} />
            <ProgressRow label="Completadas" value={tareasCompletadas} total={totalTareas} color="#22c55e" colors={colors} />
            <ProgressRow label="Aprobadas con visto bueno" value={tareasAprobadas} total={totalTareas} color="#14b8a6" colors={colors} />
            <ProgressRow label="Pendientes de visto bueno" value={tareasPendientesAprobacion} total={totalTareas} color="#d97706" colors={colors} />
            <ProgressRow label="Bloqueadas o vencidas" value={tareasBloqueadas + tareasVencidas} total={totalTareas} color="#ef4444" colors={colors} />
          </Panel>

          <Panel title="Gestión de proyectos y equipo" subtitle="Resumen operativo para decisiones" colors={colors}>
            <div style={styles.compactGrid}>
              <SmallStat label="Activos" value={proyectosActivos} color="#22c55e" colors={colors} />
              <SmallStat label="En pausa" value={proyectosPausa} color="#f59e0b" colors={colors} />
              <SmallStat label="Completados" value={proyectosCompletados} color="#3b82f6" colors={colors} />
              <SmallStat label="Cancelados" value={proyectosCancelados} color="#ef4444" colors={colors} />
              <SmallStat label="Ocupados" value={recursosOcupados} color="#f59e0b" colors={colors} />
              <SmallStat label="Vacaciones" value={recursosVacaciones} color="#0ea5e9" colors={colors} />
            </div>
            <div style={{ ...styles.levelBar, borderColor: colors.border }}>
              <LevelItem label="Junior" value={junior} color="#a855f7" />
              <LevelItem label="Semi Senior" value={semiSenior} color="#6366f1" />
              <LevelItem label="Senior" value={senior} color="#f59e0b" />
            </div>
          </Panel>
        </section>

        <SectionHeader title="Reportes KPI" subtitle="Seguimiento por proyecto y responsable" colors={colors} />
        <section style={styles.reportLayout}>
          <Panel title="Por proyecto" subtitle="Avance, aprobación y bloqueos" colors={colors}>
            <div style={styles.reportStack}>
              {kpisPorProyecto.length === 0 ? (
                <EmptyState text="Aún no hay tareas asociadas a proyectos." colors={colors} />
              ) : kpisPorProyecto.map(kpi => {
                const proyecto = proyectosPorId.get(Number(kpi.proyectoId));
                return (
                  <ReportCard
                    key={kpi.proyectoId}
                    title={proyecto ? proyecto.nombre : `Proyecto ${kpi.proyectoId}`}
                    subtitle={`ID ${kpi.proyectoId}`}
                    kpi={kpi}
                    colors={colors}
                  />
                );
              })}
            </div>
          </Panel>

          <Panel title="Por responsable" subtitle="Carga y desempeno del equipo" colors={colors}>
            <div style={styles.reportStack}>
              {kpisPorResponsable.length === 0 ? (
                <EmptyState text="Aún no hay responsables asignados a tareas." colors={colors} />
              ) : kpisPorResponsable.map(kpi => {
                const recurso = recursosPorId.get(Number(kpi.responsableId));
                return (
                  <ReportCard
                    key={kpi.responsableId}
                    title={recurso ? `${recurso.nombre} ${recurso.apellido}` : `Responsable ${kpi.responsableId}`}
                    subtitle={recurso ? recurso.cargo : `ID ${kpi.responsableId}`}
                    kpi={kpi}
                    colors={colors}
                  />
                );
              })}
            </div>
          </Panel>
        </section>

        <SectionHeader title="Asignaciones" subtitle="Relación entre proyectos y empleados" colors={colors} />
        <section style={styles.assignmentGrid}>
          {proyectos.length === 0 ? (
            <EmptyState text="Sin proyectos para relacionar." colors={colors} />
          ) : proyectos.map(proyecto => {
            const asignados = recursos.filter(recurso => getIdsProyectos(recurso).map(String).includes(String(proyecto.id)));
            return (
              <div key={proyecto.id} style={{ ...styles.assignmentCard, backgroundColor: colors.card, borderColor: colors.border }}>
                <div style={styles.assignmentTop}>
                  <strong style={{ color: colors.text }}>{proyecto.nombre}</strong>
                  <StatusPill label={proyecto.vistoBueno ? 'Aprobado' : 'Pendiente'} color={proyecto.vistoBueno ? '#22c55e' : '#f59e0b'} />
                </div>
                <p style={{ ...styles.assignmentText, color: colors.subtext }}>Responsable: {proyecto.responsable || 'Sin responsable'}</p>
                <div style={styles.badgeList}>
                  {asignados.length === 0 ? (
                    <span style={{ color: colors.subtext, fontSize: '13px' }}>Sin empleados asignados</span>
                  ) : asignados.map(recurso => (
                    <span key={recurso.id} style={{ ...styles.personBadge, borderColor: colors.border, color: colors.text }}>
                      {recurso.nombre} {recurso.apellido}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section style={styles.tablesGrid}>
          <TableCard title="Proyectos" icon={<FiBriefcase />} colors={colors}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Nombre', 'Estado', 'Responsable'].map(head => (
                    <th key={head} style={{ ...styles.th, backgroundColor: colors.tableHead, color: colors.subtext }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proyectos.map(proyecto => (
                  <tr key={proyecto.id}>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>{proyecto.nombre}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <StatusPill label={proyecto.estado} color={colorEstadoProyecto(proyecto.estado)} />
                    </td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{proyecto.responsable || 'Sin responsable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Empleados" icon={<FiUsers />} colors={colors}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Nombre', 'Cargo', 'Disponibilidad'].map(head => (
                    <th key={head} style={{ ...styles.th, backgroundColor: colors.tableHead, color: colors.subtext }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recursos.map(recurso => (
                  <tr key={recurso.id}>
                    <td style={{ ...styles.td, color: colors.text, borderColor: colors.border }}>{recurso.nombre} {recurso.apellido}</td>
                    <td style={{ ...styles.td, color: colors.subtext, borderColor: colors.border }}>{recurso.cargo}</td>
                    <td style={{ ...styles.td, borderColor: colors.border }}>
                      <StatusPill label={recurso.disponibilidad} color={colorDisponibilidad(recurso.disponibilidad)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </section>
      </main>
    </div>
  );
}

function contar(items, predicate) {
  return items.filter(predicate).length;
}

function InfoPill({ label, value, color }) {
  return (
    <div style={{ ...styles.infoPill, borderColor: `${color}55`, backgroundColor: `${color}12` }}>
      <span style={{ color }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({ icon, label, value, detail, color, colors }) {
  return (
    <div style={{ ...styles.metricCard, backgroundColor: colors.card, borderColor: colors.border }}>
      <div style={{ ...styles.metricIcon, color, backgroundColor: `${color}18` }}>{icon}</div>
      <div>
        <div style={{ ...styles.metricValue, color }}>{value}</div>
        <div style={{ color: colors.text, fontWeight: 800 }}>{label}</div>
        <div style={{ color: colors.subtext, fontSize: '12px', marginTop: '3px' }}>{detail}</div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, colors, children }) {
  return (
    <section style={{ ...styles.panel, backgroundColor: colors.card, borderColor: colors.border }}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={{ ...styles.panelTitle, color: colors.text }}>{title}</h2>
          <p style={{ ...styles.panelSubtitle, color: colors.subtext }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ProgressRow({ label, value, total, color, colors }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={styles.progressRow}>
      <div style={styles.progressLabelRow}>
        <span style={{ color: colors.text, fontWeight: 800 }}>{label}</span>
        <span style={{ color: colors.subtext }}>{value} ({percent}%)</span>
      </div>
      <div style={{ ...styles.progressTrack, backgroundColor: colors.panel }}>
        <div style={{ ...styles.progressFill, width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SmallStat({ label, value, color, colors }) {
  return (
    <div style={{ ...styles.smallStat, backgroundColor: colors.panel, borderColor: colors.border }}>
      <span style={{ color, fontWeight: 900, fontSize: '22px' }}>{value}</span>
      <span style={{ color: colors.subtext, fontSize: '12px', fontWeight: 700 }}>{label}</span>
    </div>
  );
}

function LevelItem({ label, value, color }) {
  return (
    <div style={styles.levelItem}>
      <span style={{ color, fontWeight: 900 }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}

function SectionHeader({ title, subtitle, colors }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2 style={{ ...styles.sectionTitle, color: colors.text }}>{title}</h2>
        <p style={{ ...styles.sectionSubtitle, color: colors.subtext }}>{subtitle}</p>
      </div>
    </div>
  );
}

function ReportCard({ title, subtitle, kpi, colors }) {
  const avance = kpi.avancePromedio || 0;
  return (
    <div style={{ ...styles.reportCard, backgroundColor: colors.panel, borderColor: colors.border }}>
      <div style={styles.reportHeader}>
        <div>
          <strong style={{ color: colors.text }}>{title}</strong>
          <p style={{ ...styles.reportSubtitle, color: colors.subtext }}>{subtitle}</p>
        </div>
        <StatusPill label={`${kpi.totalTareas || 0} tareas`} color="var(--primary)" />
      </div>
      <div style={{ ...styles.progressTrack, backgroundColor: '#94a3b833' }}>
        <div style={{ ...styles.progressFill, width: `${Math.min(avance, 100)}%`, backgroundColor: '#22c55e' }} />
      </div>
      <div style={{ ...styles.reportProgress, color: colors.subtext }}>
        Avance promedio: <strong style={{ color: colors.text }}>{avance}%</strong>
      </div>
      <div style={styles.reportMetrics}>
        <MiniMetric label="Comp." value={kpi.tareasCompletadas || 0} color="#22c55e" />
        <MiniMetric label="VB" value={kpi.tareasAprobadas || 0} color="#14b8a6" />
        <MiniMetric label="Pend. VB" value={kpi.tareasPendientesAprobacion || 0} color="#f59e0b" />
        <MiniMetric label="Bloq." value={kpi.tareasBloqueadas || 0} color="#ef4444" />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, color }) {
  return (
    <div style={styles.miniMetric}>
      <strong style={{ color }}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ text, colors }) {
  return (
    <div style={{ ...styles.emptyState, borderColor: colors.border, color: colors.subtext, backgroundColor: colors.panel }}>
      {text}
    </div>
  );
}

function TableCard({ title, icon, colors, children }) {
  return (
    <section style={{ ...styles.tableCard, backgroundColor: colors.card, borderColor: colors.border }}>
      <div style={{ ...styles.tableTitle, color: colors.text, borderColor: colors.border }}>
        {icon}
        <span>{title}</span>
      </div>
      <div style={styles.tableWrap}>{children}</div>
    </section>
  );
}

function StatusPill({ label, color }) {
  return (
    <span style={{ ...styles.statusPill, color, backgroundColor: `${color}18`, borderColor: `${color}66` }}>
      {label}
    </span>
  );
}

function getRolInfo(rol) {
  if (rol === 'ADMIN') {
    return {
      label: 'Administrador',
      color: 'var(--primary)',
      permisos: ['Gestión completa', 'Administra proyectos', 'Administra recursos', 'Aprueba proyectos y tareas'],
    };
  }
  if (rol === 'JEFE_PROYECTO') {
    return {
      label: 'Jefe de Proyecto',
      color: '#22c55e',
      permisos: ['Gestiona proyectos', 'Asigna responsables', 'Da visto bueno a tareas completadas'],
    };
  }
  return {
    label: 'Usuario',
    color: '#f59e0b',
    permisos: ['Visualiza informacion', 'Reporta avance de tareas asignadas'],
  };
}

function colorEstadoProyecto(estado) {
  return {
    ACTIVO: '#22c55e',
    EN_PAUSA: '#f59e0b',
    COMPLETADO: '#3b82f6',
    CANCELADO: '#ef4444',
  }[estado] || '#64748b';
}

function colorDisponibilidad(disponibilidad) {
  return {
    DISPONIBLE: '#22c55e',
    OCUPADO: '#f59e0b',
    VACACIONES: '#3b82f6',
  }[disponibilidad] || '#64748b';
}

const styles = {
  container: { maxWidth: '1420px', margin: '0 auto', padding: '26px 24px 42px' },
  centerScreen: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', fontWeight: 800 },
  hero: { border: '1px solid', borderRadius: '8px', padding: '22px', display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' },
  title: { margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: 0 },
  subtitle: { margin: '8px 0 0', maxWidth: '680px', lineHeight: 1.5, fontSize: '14px' },
  heroMeta: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  infoPill: { border: '1px solid', borderRadius: '8px', padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '130px', color: 'var(--text-primary)' },
  rolePanel: { border: '1px solid', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' },
  roleIcon: { width: '42px', height: '42px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roleText: { margin: '4px 0 0', fontSize: '13px', lineHeight: 1.45 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' },
  metricCard: { border: '1px solid', borderRadius: '8px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' },
  metricIcon: { width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  metricValue: { fontSize: '28px', fontWeight: 900, lineHeight: 1 },
  twoColumns: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '8px' },
  panel: { border: '1px solid', borderRadius: '8px', padding: '18px', boxShadow: 'var(--shadow-sm)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  panelTitle: { margin: 0, fontSize: '18px', fontWeight: 900 },
  panelSubtitle: { margin: '4px 0 0', fontSize: '13px' },
  progressRow: { marginBottom: '14px' },
  progressLabelRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', marginBottom: '7px' },
  progressTrack: { width: '100%', height: '9px', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px' },
  compactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  smallStat: { border: '1px solid', borderRadius: '7px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  levelBar: { marginTop: '14px', border: '1px solid', borderRadius: '7px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', color: 'var(--text-secondary)' },
  levelItem: { display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'center', fontSize: '12px', fontWeight: 700 },
  sectionHeader: { margin: '26px 0 12px' },
  sectionTitle: { margin: 0, fontSize: '20px', fontWeight: 900 },
  sectionSubtitle: { margin: '4px 0 0', fontSize: '13px' },
  reportLayout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' },
  reportStack: { display: 'grid', gap: '10px' },
  reportCard: { border: '1px solid', borderRadius: '7px', padding: '13px' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' },
  reportSubtitle: { margin: '3px 0 0', fontSize: '12px' },
  reportProgress: { marginTop: '7px', fontSize: '12px' },
  reportMetrics: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' },
  miniMetric: { borderRadius: '7px', padding: '8px', backgroundColor: 'color-mix(in srgb, var(--text-tertiary) 12%, transparent)', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' },
  assignmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' },
  assignmentCard: { border: '1px solid', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-sm)' },
  assignmentTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  assignmentText: { margin: '8px 0 10px', fontSize: '12px' },
  badgeList: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  personBadge: { border: '1px solid', borderRadius: '999px', padding: '5px 9px', fontSize: '12px', fontWeight: 700 },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginTop: '22px' },
  tableCard: { border: '1px solid', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  tableTitle: { padding: '14px 16px', borderBottom: '1px solid', display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 900 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '520px' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0 },
  td: { padding: '12px 14px', borderTop: '1px solid', fontSize: '13px' },
  statusPill: { border: '1px solid', borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap' },
  emptyState: { border: '1px solid', borderRadius: '7px', padding: '16px', fontSize: '13px' },
};

export default Dashboard;
