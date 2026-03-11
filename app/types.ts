export type ServiceType = 'domicilio' | 'envio' | 'pasajero' | 'otro';

export interface ServiceRecord {
    id: string;
    type: ServiceType;
    price: number;
    timestamp: string; // ISO string
    date: string;      // YYYY-MM-DD
    user_id?: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
    domicilio: 'Domicilio',
    envio: 'Envío',
    pasajero: 'Pasajero',
    otro: 'Otro',
};

export const SERVICE_EMOJIS: Record<ServiceType, string> = {
    domicilio: '🛵',
    envio: '📦',
    pasajero: '👤',
    otro: '➕',
};

export const PRESET_PRICES = [3000, 5000, 7000, 8000, 10000, 12000, 15000];

// ─── Gastos ───────────────────────────────────────────────────────────────────

export type ExpenseType = 'gasolina' | 'comida' | 'mantenimiento' | 'otro';

export interface ExpenseRecord {
    id: string;
    type: ExpenseType;
    amount: number;
    note?: string;
    timestamp: string; // ISO string
    date: string;      // YYYY-MM-DD
    user_id?: string;
}

export const EXPENSE_LABELS: Record<ExpenseType, string> = {
    gasolina: 'Gasolina',
    comida: 'Comida',
    mantenimiento: 'Mantenimiento',
    otro: 'Otro',
};

export const EXPENSE_EMOJIS: Record<ExpenseType, string> = {
    gasolina: '⛽',
    comida: '🍔',
    mantenimiento: '🔧',
    otro: '🧾',
};

export const EXPENSE_PRESET_AMOUNTS = [2000, 5000, 10000, 15000, 20000, 30000, 50000];

// ─── Vehículos y Mantenimiento ──────────────────────────────────────────────────

export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    name: string;
    current_km: number;
    user_id?: string;
    created_at?: string;
}

export interface MaintenanceRule {
    id: string;
    vehicle_id: string;
    name: string;
    interval_km: number;
    last_service_km: number;
    next_service_km: number;
    custom_warning_km?: number | null;
    created_at?: string;
}

export interface MaintenanceLog {
    id: string;
    rule_id: string;
    km: number;
    notes?: string;
    created_at?: string;
}

export type MaintenanceStatusType = 'safe' | 'upcoming' | 'overdue';

export interface MaintenanceStatus {
    rule: MaintenanceRule;
    status: MaintenanceStatusType;
    remaining_km: number;
}
