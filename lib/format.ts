export const cop = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-CO') + ' COP'

export const parseImages = (s: string): string[] => {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
