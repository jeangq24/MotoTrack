import { MaintenanceRule, MaintenanceStatus, MaintenanceStatusType } from '@/app/types';

export const DEFAULT_WARNING_RANGE_KM = 500;

export function calculateMaintenanceStatus(rule: MaintenanceRule, currentKm: number): MaintenanceStatus {
    const remainingKm = rule.next_service_km - currentKm;
    const warningRange = rule.custom_warning_km ?? DEFAULT_WARNING_RANGE_KM;
    let status: MaintenanceStatusType = 'safe';

    if (currentKm >= rule.next_service_km) {
        status = 'overdue';
    } else if (currentKm >= (rule.next_service_km - warningRange)) {
        status = 'upcoming';
    }

    return {
        rule,
        status,
        remaining_km: remainingKm
    };
}
