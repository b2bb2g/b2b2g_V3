// EPC 프로젝트 enum → i18n 키 매핑(단일 지점) + 기간·금액 포맷.
import type { ProjectField, ProjectStage } from '@/lib/supabase/database.types';

export const FIELD_KEY: Record<ProjectField, string> = {
  power_plant: 'fieldPowerPlant',
  construction: 'fieldConstruction',
  factory: 'fieldFactory',
  plant: 'fieldPlant',
  civil: 'fieldCivil',
  etc: 'fieldEtc',
};

export const STAGE_KEY: Record<ProjectStage, string> = {
  planning: 'stagePlanning',
  bidding: 'stageBidding',
  in_progress: 'stageInProgress',
  completed: 'stageCompleted',
};

export function formatPeriod(startsOn: string | null, endsOn: string | null): string {
  const s = startsOn ?? '';
  const e = endsOn ?? '';
  if (s && e) return `${s} ~ ${e}`;
  return s || e || '';
}

export function formatScale(amount: number | null, currency: string | null): string {
  if (amount == null) return '';
  return `${amount.toLocaleString()}${currency ? ` ${currency}` : ''}`;
}
