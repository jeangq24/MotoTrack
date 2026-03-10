import { MaintenanceRule, MaintenanceStatus, MaintenanceStatusType } from '@/app/types';

export const WARNING_RANGE_KM = 500;

export function calculateMaintenanceStatus(rule: MaintenanceRule, currentKm: number): MaintenanceStatus {
    const remainingKm = rule.next_service_km - currentKm;
    let status: MaintenanceStatusType = 'safe';

    if (currentKm >= rule.next_service_km) {
        status = 'overdue';
    } else if (currentKm >= (rule.next_service_km - WARNING_RANGE_KM)) {
        status = 'upcoming';
    }

    return {
        rule,
        status,
        remaining_km: remainingKm
    };
}
