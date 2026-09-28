// Formateo de moneda (Guaraníes)
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

// Formateo de números simples
export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat('es-PY').format(valor);
}

// Formatear fecha ISO a legible
export function formatearFecha(fecha: string | undefined | null, opciones?: Intl.DateTimeFormatOptions): string {
  if (!fecha) return '—';
  const d = new Date(fecha + (fecha.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('es-PY', opciones || { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Fecha larga
export function formatearFechaLarga(fecha: string | undefined | null): string {
  return formatearFecha(fecha, { day: '2-digit', month: 'long', year: 'numeric' });
}

// Mes y año
export function formatearPeriodo(periodo: string): string {
  if (!periodo) return '—';
  const [anio, mes] = periodo.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[parseInt(mes) - 1]} ${anio}`;
}

// Nombre del mes
export function nombreMes(mes: number): string {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes - 1] || '';
}

// Horas a texto
export function formatearHoras(horas: number): string {
  if (!horas || horas === 0) return '0h';
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Iniciales del nombre
export function iniciales(nombre: string, apellido?: string): string {
  const n = nombre?.[0]?.toUpperCase() || '';
  const a = (apellido || nombre.split(' ')[1] || '')?.[0]?.toUpperCase() || '';
  return `${n}${a}`;
}

// Color para avatar basado en nombre
export function colorAvatar(nombre: string): string {
  const colores = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return colores[Math.abs(hash) % colores.length];
}

// Fecha relativa
export function fechaRelativa(fecha: string): string {
  const ahora = new Date();
  const d = new Date(fecha);
  const diff = ahora.getTime() - d.getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
  return formatearFecha(fecha);
}

// Convertir snake_case a camelCase para respuestas de API
export function snakeToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}
