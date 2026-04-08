// People who can register expenses
export type Person = 'jenny' | 'antonio' | 'cacho';

// Socio 1 = Jenny + Antonio (50% share)
// Socio 2 = Cacho (50% share)
export type Socio = 'socio1' | 'socio2';

export function getSocio(person: Person): Socio {
  return person === 'cacho' ? 'socio2' : 'socio1';
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: Person;
  category: Category;
  receipt_url: string | null;
  date: string;
  archived: number;
  created_at: string;
}

export const PERSON_LABELS: Record<Person, string> = {
  jenny: 'Jenny',
  antonio: 'Antonio',
  cacho: 'Cacho',
};

export const SOCIO_LABELS: Record<Socio, string> = {
  socio1: 'Jenny + Antonio',
  socio2: 'Cacho',
};

export const PERSON_COLOR: Record<Person, string> = {
  jenny: '#EC4899',
  antonio: '#8B5CF6',
  cacho: '#3B82F6',
};

export const PERSON_BG: Record<Person, string> = {
  jenny: '#FDF2F8',
  antonio: '#F5F3FF',
  cacho: '#EFF6FF',
};

export const SOCIO_COLOR: Record<Socio, string> = {
  socio1: '#10B981',
  socio2: '#3B82F6',
};

export const SOCIO_BG: Record<Socio, string> = {
  socio1: '#ECFDF5',
  socio2: '#EFF6FF',
};

export const CATEGORIES = [
  'artículos de limpieza',
  'amenidades/toiletries',
  'ropa de cama',
  'cocina',
  'mantenimiento',
  'empleada',
  'jardinero',
  'internet',
  'otro',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
  'artículos de limpieza': '🧹',
  'amenidades/toiletries': '🛁',
  'ropa de cama': '🛏️',
  cocina: '🍳',
  mantenimiento: '🔧',
  empleada: '👩‍🍳',
  jardinero: '🌿',
  internet: '📡',
  otro: '📦',
};
