export function getSafeRefreshIntervalSec(realtimeAssetCount: number): number {
  if (realtimeAssetCount <= 5) return 5;
  if (realtimeAssetCount <= 10) return 10;
  return 30;
}

export function getEffectiveRefreshIntervalSec(
  selectedIntervalSec: number,
  realtimeAssetCount: number,
): number {
  if (selectedIntervalSec === 0) return 0;
  return Math.max(selectedIntervalSec, getSafeRefreshIntervalSec(realtimeAssetCount));
}
