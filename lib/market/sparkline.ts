const sparklineBars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function buildSparkline(points: number[]): string {
  const cleanPoints = points.filter((point) => Number.isFinite(point));

  if (cleanPoints.length === 0) return "";
  if (cleanPoints.length === 1) return "▄";

  const min = Math.min(...cleanPoints);
  const max = Math.max(...cleanPoints);

  if (min === max) {
    return cleanPoints.map(() => "▄").join("");
  }

  return cleanPoints
    .map((point) => {
      const ratio = (point - min) / (max - min);
      const index = Math.min(sparklineBars.length - 1, Math.max(0, Math.round(ratio * (sparklineBars.length - 1))));
      return sparklineBars[index];
    })
    .join("");
}
