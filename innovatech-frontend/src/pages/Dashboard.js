import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';
import { FiFolder, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { darkMode } = useTheme(); // Lee el tema global

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
        const response = await dashboardService.getDashboard();
        setDashboard(response.data);
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

        {/* KPIs principales */}
        <div style={styles.kpiGrid}>
          <KpiCard icon={<FiFolder size={24} />} label="Total Proyectos"
            value={dashboard.totalProyectos} color="#6366f1" darkMode={darkMode} />
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
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
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
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '8px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '8px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '8px' },
  tablesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '12px 16px', borderBottom: '1px solid', fontSize: '14px' },
  badge: { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  empty: { textAlign: 'center', padding: '32px', fontSize: '14px' },
};

export default Dashboard;