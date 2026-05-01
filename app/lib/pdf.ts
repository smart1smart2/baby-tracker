import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import type { TFunction } from 'i18next';

import { categoryColors, palette } from '@/constants';
import { MEASUREMENT_KINDS, measurementKindKey } from '@/features/measurements/labels';
import type { StatsBuckets } from '@/hooks/use-stats-buckets';
import type { DailyBucket } from '@/lib/aggregate';
import type { Child, GrowthMeasurement, MeasurementKind } from '@/types/domain';

const DIAPER_NORM = { min: 5, max: 8 };

type ExportOptions = {
  child: Child;
  buckets: StatsBuckets;
  measurements: GrowthMeasurement[];
  rangeDays: number;
  t: TFunction;
  locale: Locale;
};

export async function exportStatsPdf(opts: ExportOptions) {
  // Lazy-loaded so the Stats screen still bundles in Expo Go (which lacks
  // these native modules). Export itself only works in a dev build.
  const Print = require('expo-print') as typeof import('expo-print');
  const Sharing = require('expo-sharing') as typeof import('expo-sharing');

  const html = buildHtml(opts);
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: opts.t('stats.export.shareTitle'),
  });
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function buildHtml({
  child,
  buckets,
  measurements,
  rangeDays,
  t,
  locale,
}: ExportOptions): string {
  const today = new Date();
  const fromDate = buckets.feedings[0]?.date ?? today;
  const rangeLabel = t('stats.export.rangeLabel', {
    from: format(fromDate, 'd MMM', { locale }),
    to: format(today, 'd MMM yyyy', { locale }),
  });

  const sections: string[] = [];

  sections.push(
    bucketCard({
      title: t('stats.feedings.title'),
      tint: categoryColors.feeding,
      buckets: buckets.feedings,
      formatValue: (v) => String(v),
      total: t('stats.feedings.totalCount', {
        count: buckets.feedings.reduce((acc, b) => acc + b.value, 0),
      }),
      t,
      locale,
    }),
  );

  const totalSleep = buckets.sleepHours.reduce((acc, b) => acc + b.value, 0);
  sections.push(
    bucketCard({
      title: t('stats.sleep.title'),
      tint: categoryColors.sleep,
      buckets: buckets.sleepHours,
      formatValue: (v) => `${v.toFixed(1)} h`,
      total: t('stats.sleep.totalHours', { hours: totalSleep.toFixed(1) }),
      hint:
        buckets.sleepsCount > 0
          ? `${t('stats.sleep.night', { hours: buckets.sleepSplit.night.toFixed(1) })}` +
            `  ·  ${t('stats.sleep.day', { hours: buckets.sleepSplit.day.toFixed(1) })}`
          : null,
      t,
      locale,
    }),
  );

  const diaperHint =
    buckets.diaperActiveDays < 3 || buckets.diaperAvg < 1
      ? null
      : buckets.diaperAvg < DIAPER_NORM.min
        ? t('stats.diapers.belowRange', { avg: buckets.diaperAvg })
        : buckets.diaperAvg > DIAPER_NORM.max
          ? t('stats.diapers.aboveRange', { avg: buckets.diaperAvg })
          : t('stats.diapers.withinRange', DIAPER_NORM);
  sections.push(
    bucketCard({
      title: t('stats.diapers.title'),
      tint: categoryColors.diaper,
      buckets: buckets.diapers,
      formatValue: (v) => String(v),
      total: t('stats.diapers.totalCount', { count: buckets.diapersCount }),
      hint: diaperHint,
      t,
      locale,
    }),
  );

  const growthSections = MEASUREMENT_KINDS.map((kind) =>
    measurementCard({
      kind,
      measurements: measurements.filter((m) => m.kind === kind),
      t,
      locale,
    }),
  ).join('');

  return /* html */ `<!DOCTYPE html>
<html lang="${escapeHtml(locale.code ?? 'en')}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(child.full_name)} — ${escapeHtml(t('stats.title'))}</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: ${palette.neutral[800]};
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
  }
  .hero {
    background: ${palette.primary[500]};
    color: ${palette.white};
    padding: 24px 28px;
    border-radius: 16px;
    margin-bottom: 28px;
  }
  .hero h1 { margin: 0 0 6px; font-size: 24px; font-weight: 700; }
  .hero .range { font-size: 13px; opacity: 0.85; }
  h2 {
    font-size: 16px;
    margin: 28px 0 14px;
    color: ${palette.neutral[700]};
    font-weight: 700;
  }
  .card {
    background: ${palette.neutral[25]};
    border: 1px solid ${palette.neutral[100]};
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .swatch {
    width: 10px; height: 10px; border-radius: 3px;
  }
  .card-title { font-size: 13px; font-weight: 600; color: ${palette.neutral[700]}; }
  .card-total { margin-left: auto; font-size: 12px; color: ${palette.neutral[500]}; }
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 5px 4px;
    border-bottom: 1px solid ${palette.neutral[50]};
    font-size: 12.5px;
  }
  th {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: ${palette.neutral[400]};
    font-weight: 600;
  }
  td.value, th.value { text-align: right; font-variant-numeric: tabular-nums; }
  td.muted { color: ${palette.neutral[400]}; }
  .hint {
    margin-top: 10px;
    font-size: 12px;
    color: ${palette.neutral[500]};
  }
  .empty {
    font-size: 12.5px;
    color: ${palette.neutral[400]};
    padding: 4px 0;
  }
  footer {
    margin-top: 32px;
    text-align: center;
    font-size: 10.5px;
    color: ${palette.neutral[400]};
  }
</style>
</head>
<body>
  <div class="hero">
    <h1>${escapeHtml(child.full_name)}</h1>
    <div class="range">${escapeHtml(rangeLabel)}</div>
  </div>

  <h2>${escapeHtml(t('stats.lastWeek.title'))}</h2>
  ${sections.join('')}

  <h2>${escapeHtml(t('stats.growth.title'))}</h2>
  ${growthSections}

  <footer>${escapeHtml(
    t('stats.export.generated', {
      date: format(today, 'd MMM yyyy, HH:mm', { locale }),
    }),
  )}</footer>
</body>
</html>`;
}

function bucketCard({
  title,
  tint,
  buckets,
  formatValue,
  total,
  hint,
  t,
  locale,
}: {
  title: string;
  tint: string;
  buckets: DailyBucket[];
  formatValue: (v: number) => string;
  total: string;
  hint?: string | null;
  t: TFunction;
  locale: Locale;
}): string {
  const rows = buckets
    .map((b) => {
      const dateLabel = format(b.date, 'EEE, d MMM', { locale });
      const isZero = b.value === 0;
      return `<tr><td${isZero ? ' class="muted"' : ''}>${escapeHtml(dateLabel)}</td>` +
        `<td class="value${isZero ? ' muted' : ''}">${escapeHtml(formatValue(b.value))}</td></tr>`;
    })
    .join('');

  return /* html */ `
<div class="card">
  <div class="card-head">
    <div class="swatch" style="background:${tint}"></div>
    <div class="card-title">${escapeHtml(title)}</div>
    <div class="card-total">${escapeHtml(total)}</div>
  </div>
  <table>
    <thead>
      <tr><th>${escapeHtml(t('stats.export.dateColumn'))}</th>` +
    `<th class="value">${escapeHtml(t('stats.export.valueColumn'))}</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${hint ? `<div class="hint">${escapeHtml(hint)}</div>` : ''}
</div>`;
}

function measurementCard({
  kind,
  measurements,
  t,
  locale,
}: {
  kind: MeasurementKind;
  measurements: GrowthMeasurement[];
  t: TFunction;
  locale: Locale;
}): string {
  const title = t(measurementKindKey(kind));
  const tint =
    kind === 'weight'
      ? palette.tertiary[400]
      : kind === 'height'
        ? categoryColors.growth
        : palette.secondary[400];

  if (measurements.length === 0) {
    return /* html */ `
<div class="card">
  <div class="card-head">
    <div class="swatch" style="background:${tint}"></div>
    <div class="card-title">${escapeHtml(title)}</div>
  </div>
  <div class="empty">${escapeHtml(t('stats.export.noMeasurements'))}</div>
</div>`;
  }

  const sorted = [...measurements].sort((a, b) =>
    a.measured_at < b.measured_at ? 1 : -1,
  );
  const recent = sorted.slice(0, 8);
  const latest = sorted[0];
  const latestLabel = `${latest.value} ${latest.unit}`;

  const rows = recent
    .map(
      (m) =>
        `<tr><td>${escapeHtml(format(new Date(m.measured_at), 'd MMM yyyy', { locale }))}</td>` +
        `<td class="value">${escapeHtml(`${m.value} ${m.unit}`)}</td></tr>`,
    )
    .join('');

  return /* html */ `
<div class="card">
  <div class="card-head">
    <div class="swatch" style="background:${tint}"></div>
    <div class="card-title">${escapeHtml(title)}</div>
    <div class="card-total">${escapeHtml(latestLabel)}</div>
  </div>
  <table>
    <thead>
      <tr><th>${escapeHtml(t('stats.export.dateColumn'))}</th>` +
    `<th class="value">${escapeHtml(t('stats.export.valueColumn'))}</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
}
