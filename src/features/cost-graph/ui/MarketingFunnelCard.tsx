/**
 * Marketing funnel card in the workbench — expand campaigns, ⋯ menu.
 * Retarget sits below the funnel (funnel-level), not inside the campaign list.
 * Location: src/features/cost-graph/ui/MarketingFunnelCard.tsx
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MarketingCampaign, MarketingFunnel } from '@/features/funnels'
import { createEmptyCampaign } from '@/features/funnels'
import type { WorkbenchCostRow } from '../application/project-workbench-view'

type Props = {
  funnel: MarketingFunnel
  row: WorkbenchCostRow
  expanded: boolean
  onToggle: () => void
  onSetEnabled: (enabled: boolean) => void
  onDeleteFunnel: () => void
  onRename: (name: string) => void
  onCampaignsChange: (campaigns: MarketingCampaign[]) => void
}

function formatMoney(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(2)} €`
}

function CampaignFields({
  campaign,
  onPatch,
  onRemove,
}: {
  campaign: MarketingCampaign
  onPatch: (patch: Partial<MarketingCampaign>) => void
  onRemove: () => void
}) {
  const retarget = campaign.kind === 'retarget'
  return (
    <div
      className={`rounded-md border p-2 ${
        retarget
          ? 'border-[color:var(--line-default)] bg-[#f3f6fd]'
          : 'border-[color:var(--line-default)] bg-[color:var(--surface-rail)]'
      }`}
      data-testid={`campaign-${campaign.id}`}
      data-campaign-kind={retarget ? 'retarget' : 'standard'}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <input
          className="min-w-0 flex-1 rounded border border-[color:var(--line-default)] bg-white px-2 py-1 text-xs font-medium"
          value={campaign.name}
          aria-label="Kampagnenname"
          onChange={(e) => onPatch({ name: e.target.value })}
        />
        <button
          type="button"
          className="shrink-0 px-1 text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--semantic-cost)]"
          aria-label={`${campaign.name} entfernen`}
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 items-end gap-x-2 gap-y-0.5">
        <span className="text-[10px] leading-tight text-[color:var(--ink-muted)]">
          Kosten / Conv.
        </span>
        <span className="text-[10px] leading-tight text-[color:var(--ink-muted)]">
          Conv.-Rate %
        </span>
        <input
          className="w-full min-w-0 rounded border border-[color:var(--line-default)] bg-white px-2 py-1 font-variant-numeric text-xs tabular-nums"
          type="number"
          min={0}
          step="0.01"
          value={campaign.costPerConversion}
          aria-label={`${campaign.name} Kosten pro Conversion`}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isFinite(n) || n < 0) return
            onPatch({ costPerConversion: n })
          }}
        />
        <input
          className="w-full min-w-0 rounded border border-[color:var(--line-default)] bg-white px-2 py-1 font-variant-numeric text-xs tabular-nums"
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={Number((campaign.conversionRate * 100).toFixed(2))}
          aria-label={`${campaign.name} Conversionrate`}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isFinite(n) || n < 0 || n > 100) return
            onPatch({ conversionRate: n / 100 })
          }}
        />
      </div>
    </div>
  )
}

/** Tree rail: T-junction mid-list, L-elbow on last — no dangling trunk. */
function TreeLink({ isLast, children }: { isLast: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-0">
      <div className="relative w-4 shrink-0 self-stretch" aria-hidden>
        <span
          className={`absolute left-1/2 w-px -translate-x-1/2 bg-[color:var(--accent-analysis)] ${
            isLast ? 'top-0 h-1/2' : 'inset-y-0'
          }`}
        />
        <span className="absolute left-1/2 top-1/2 h-px w-1/2 bg-[color:var(--accent-analysis)]" />
      </div>
      <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-2'}`}>{children}</div>
    </div>
  )
}

export function MarketingFunnelCard({
  funnel,
  row,
  expanded,
  onToggle,
  onSetEnabled,
  onDeleteFunnel,
  onRename,
  onCampaignsChange,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(funnel.name)
  const menuRef = useRef<HTMLDivElement>(null)
  const campaigns = funnel.campaigns ?? []
  const standardCampaigns = campaigns.filter((c) => c.kind !== 'retarget')
  const retargetCampaigns = campaigns.filter((c) => c.kind === 'retarget')

  useEffect(() => {
    setNameDraft(funnel.name)
  }, [funnel.name])

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  function addCampaign(kind: 'standard' | 'retarget' = 'standard') {
    const next =
      kind === 'retarget'
        ? createEmptyCampaign('Retarget Kampagne', 'retarget')
        : createEmptyCampaign()
    onCampaignsChange([...campaigns, next])
    setMenuOpen(false)
    if (kind === 'standard' && !expanded) onToggle()
  }

  function patchCampaign(id: string, patch: Partial<MarketingCampaign>) {
    onCampaignsChange(campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeCampaign(id: string) {
    onCampaignsChange(campaigns.filter((c) => c.id !== id))
  }

  return (
    <div className="relative flex flex-col" data-testid={`funnel-stack-${funnel.name}`}>
      <div
        className={`rounded-[10px] border border-[color:var(--line-default)] bg-white p-2 shadow-[0_1px_0_rgba(23,32,51,0.04)] ${
          row.enabled ? '' : 'opacity-60'
        }`}
        data-testid={`funnel-card-${funnel.name}`}
        data-expanded={expanded ? 'true' : 'false'}
        data-funnel="true"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-x-2">
          <label
            className="flex h-5 w-5 items-center justify-center"
            title={row.enabled ? 'Deaktivieren' : 'Aktivieren'}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-[color:var(--line-default)]"
              checked={row.enabled}
              aria-label={`${funnel.name} aktiv`}
              onChange={(e) => onSetEnabled(e.target.checked)}
            />
          </label>

          <div className="min-w-0">
            <input
              className={`w-full min-w-0 rounded border border-[color:var(--line-default)] bg-white px-1.5 py-0.5 text-[13px] font-medium leading-snug ${
                row.enabled
                  ? 'text-[color:var(--ink-primary)]'
                  : 'text-[color:var(--ink-muted)] line-through'
              }`}
              value={nameDraft}
              aria-label="Funnel-Name"
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                const next = nameDraft.trim() || 'Funnel'
                if (next !== funnel.name) onRename(next)
                else setNameDraft(funnel.name)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded bg-[#e8eefc] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--accent-analysis)]"
              onClick={onToggle}
              aria-expanded={expanded}
            >
              Kampagne
              <span aria-hidden>{expanded ? '▼' : '▶'}</span>
            </button>
          </div>

          <p className="max-w-[4.75rem] pt-0.5 text-right font-variant-numeric text-[13px] font-semibold tabular-nums">
            {!row.enabled
              ? formatMoney(0)
              : row.unresolved
                ? '…'
                : formatMoney(row.perUnit)}
          </p>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded text-base leading-none text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-rail)]"
              aria-label="Funnel-Menü"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-30 mt-1 w-48 rounded-[8px] border border-[color:var(--line-default)] bg-white py-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--surface-rail)]"
                  onClick={() => addCampaign('standard')}
                >
                  Kampagne hinzufügen
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--surface-rail)]"
                  onClick={() => addCampaign('retarget')}
                >
                  Retarget hinzufügen
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-xs text-[color:var(--semantic-cost)] hover:bg-[color:var(--surface-rail)]"
                  onClick={() => {
                    setMenuOpen(false)
                    onDeleteFunnel()
                  }}
                >
                  Funnel löschen
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {expanded && row.enabled ? (
          <div className="mt-2 flex flex-col gap-2 border-t border-[color:var(--line-default)] pt-2">
            {standardCampaigns.length === 0 ? (
              <p className="text-[11px] text-[color:var(--ink-muted)]">
                Noch keine Kampagnen. Über ⋯ hinzufügen.
              </p>
            ) : (
              <div className="flex flex-col pl-1">
                {standardCampaigns.map((c, i) => (
                  <TreeLink key={c.id} isLast={i === standardCampaigns.length - 1}>
                    <CampaignFields
                      campaign={c}
                      onPatch={(patch) => patchCampaign(c.id, patch)}
                      onRemove={() => removeCampaign(c.id)}
                    />
                  </TreeLink>
                ))}
              </div>
            )}
            <button
              type="button"
              className="rounded border border-dashed border-[color:var(--line-default)] bg-white px-2 py-1 text-[11px] text-[color:var(--ink-muted)] hover:border-[color:var(--accent-analysis)] hover:text-[color:var(--accent-analysis)]"
              onClick={() => addCampaign('standard')}
            >
              + Kampagne
            </button>
            <p className="text-[11px] text-[color:var(--ink-muted)]">
              Blend: {row.unresolved ? 'unvollständig' : formatMoney(row.perUnit)} / Auftrag
            </p>
          </div>
        ) : null}
      </div>

      {retargetCampaigns.length > 0 && row.enabled ? (
        <div
          className="flex flex-col pl-1"
          data-testid={`funnel-retargets-${funnel.name}`}
        >
          {/* Short stem leaving the funnel card into the first elbow */}
          <div className="ml-2 h-2.5 w-px bg-[color:var(--accent-analysis)]" aria-hidden />
          {retargetCampaigns.map((c, i) => (
            <TreeLink key={c.id} isLast={i === retargetCampaigns.length - 1}>
              <CampaignFields
                campaign={c}
                onPatch={(patch) => patchCampaign(c.id, patch)}
                onRemove={() => removeCampaign(c.id)}
              />
            </TreeLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}
