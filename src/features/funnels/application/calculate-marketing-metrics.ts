/**
 * Pure marketing-funnel metric derivation (media-only vs fully loaded).
 * Location: src/features/funnels/application/calculate-marketing-metrics.ts
 */
import type { MarketingFunnel } from '../domain/marketing-funnel'

export type FunnelMetricStatus = 'ok' | 'unresolved'

export type FunnelMetricValue =
  | { status: 'ok'; value: number; scope: 'media_only' | 'fully_loaded' | 'volume' }
  | { status: 'unresolved'; reason: string; messageDe: string; scope: 'media_only' | 'fully_loaded' | 'volume' }

export type MarketingFunnelMetrics = {
  impressions: FunnelMetricValue
  clicks: FunnelMetricValue
  conversions: FunnelMetricValue
  ctr: FunnelMetricValue
  cvr: FunnelMetricValue
  cpc: FunnelMetricValue
  /** Media spend / conversions */
  mediaCpa: FunnelMetricValue
  /** Media spend / conversions (alias scope for CAC media-only) */
  mediaCac: FunnelMetricValue
  /** (media + agency + personnel + tools) / conversions */
  fullyLoadedCac: FunnelMetricValue
  mediaSpend: number
  operatingCosts: number
  fullyLoadedSpend: number
}

function stageByKey(funnel: MarketingFunnel, key: string) {
  return funnel.stages.find((s) => s.key === key)
}

function unresolved(
  scope: FunnelMetricValue['scope'],
  reason: string,
  messageDe: string,
): FunnelMetricValue {
  return { status: 'unresolved', reason, messageDe, scope }
}

function ok(scope: FunnelMetricValue['scope'], value: number): FunnelMetricValue {
  return { status: 'ok', value, scope }
}

function resolveVolume(funnel: MarketingFunnel): {
  impressions: FunnelMetricValue
  clicks: FunnelMetricValue
  conversions: FunnelMetricValue
  ctr: FunnelMetricValue
  cvr: FunnelMetricValue
} {
  const impressionsStage = stageByKey(funnel, 'impressions')
  const clicksStage = stageByKey(funnel, 'clicks')
  const conversionsStage = stageByKey(funnel, 'conversions')

  const impressionsCount = impressionsStage?.count
  let clicksCount = clicksStage?.count
  let conversionsCount = conversionsStage?.count

  const impressions: FunnelMetricValue =
    impressionsCount === undefined
      ? unresolved('volume', 'missing_impressions', 'Impressionen fehlen.')
      : ok('volume', impressionsCount)

  if (clicksCount === undefined && impressionsCount !== undefined && clicksStage?.conversionRate !== undefined) {
    clicksCount = impressionsCount * clicksStage.conversionRate
  }

  const clicks: FunnelMetricValue =
    clicksCount === undefined
      ? unresolved('volume', 'missing_clicks', 'Klicks fehlen — CPC kann nicht berechnet werden.')
      : ok('volume', clicksCount)

  let ctr: FunnelMetricValue
  if (impressions.status !== 'ok' || clicks.status !== 'ok') {
    ctr = unresolved('volume', 'missing_ctr_inputs', 'CTR benötigt Impressionen und Klicks.')
  } else if (impressions.value === 0) {
    ctr = unresolved('volume', 'zero_impressions', 'CTR nicht berechenbar: 0 Impressionen.')
  } else {
    ctr = ok('volume', clicks.value / impressions.value)
  }

  if (
    conversionsCount === undefined &&
    clicks.status === 'ok' &&
    conversionsStage?.conversionRate !== undefined
  ) {
    conversionsCount = clicks.value * conversionsStage.conversionRate
  }

  const conversions: FunnelMetricValue =
    conversionsCount === undefined
      ? unresolved('volume', 'missing_conversions', 'Conversions fehlen — CPA/CAC können nicht berechnet werden.')
      : ok('volume', conversionsCount)

  let cvr: FunnelMetricValue
  if (clicks.status !== 'ok' || conversions.status !== 'ok') {
    cvr = unresolved('volume', 'missing_cvr_inputs', 'CVR benötigt Klicks und Conversions.')
  } else if (clicks.value === 0) {
    cvr = unresolved('volume', 'zero_clicks', 'CVR nicht berechenbar: 0 Klicks.')
  } else {
    cvr = ok('volume', conversions.value / clicks.value)
  }

  return { impressions, clicks, conversions, ctr, cvr }
}

/**
 * Derive acquisition metrics. Never returns silent zero for missing denominators.
 */
export function calculateMarketingMetrics(funnel: MarketingFunnel): MarketingFunnelMetrics {
  const volume = resolveVolume(funnel)
  const mediaSpend = funnel.costs.mediaSpend
  const operatingCosts = funnel.costs.agency + funnel.costs.personnel + funnel.costs.tools
  const fullyLoadedSpend = mediaSpend + operatingCosts

  let cpc: FunnelMetricValue
  if (volume.clicks.status !== 'ok') {
    cpc = unresolved('media_only', 'missing_clicks', volume.clicks.messageDe)
  } else if (volume.clicks.value === 0) {
    cpc = unresolved('media_only', 'zero_clicks', 'CPC nicht berechenbar: 0 Klicks.')
  } else if (mediaSpend === 0) {
    cpc = unresolved(
      'media_only',
      'zero_spend',
      'CPC nicht sinnvoll: Media-Spend ist 0 bei vorhandenen Klicks.',
    )
  } else {
    cpc = ok('media_only', mediaSpend / volume.clicks.value)
  }

  let mediaCpa: FunnelMetricValue
  let mediaCac: FunnelMetricValue
  if (volume.conversions.status !== 'ok') {
    mediaCpa = unresolved('media_only', 'missing_conversions', volume.conversions.messageDe)
    mediaCac = unresolved('media_only', 'missing_conversions', volume.conversions.messageDe)
  } else if (volume.conversions.value === 0) {
    mediaCpa = unresolved('media_only', 'zero_conversions', 'Media-CPA nicht berechenbar: 0 Conversions.')
    mediaCac = unresolved('media_only', 'zero_conversions', 'Media-CAC nicht berechenbar: 0 Conversions.')
  } else {
    mediaCpa = ok('media_only', mediaSpend / volume.conversions.value)
    mediaCac = ok('media_only', mediaSpend / volume.conversions.value)
  }

  let fullyLoadedCac: FunnelMetricValue
  if (volume.conversions.status !== 'ok') {
    fullyLoadedCac = unresolved('fully_loaded', 'missing_conversions', volume.conversions.messageDe)
  } else if (volume.conversions.value === 0) {
    fullyLoadedCac = unresolved(
      'fully_loaded',
      'zero_conversions',
      'Fully-loaded CAC nicht berechenbar: 0 Conversions.',
    )
  } else {
    fullyLoadedCac = ok('fully_loaded', fullyLoadedSpend / volume.conversions.value)
  }

  return {
    ...volume,
    cpc,
    mediaCpa,
    mediaCac,
    fullyLoadedCac,
    mediaSpend,
    operatingCosts,
    fullyLoadedSpend,
  }
}
