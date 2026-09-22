/**
 * Layer guidance: general + industry-specific examples (FR-022).
 * Location: src/features/templates/ui/LayerGuidancePanel.tsx
 */
import type { TemplateLayer } from '../domain/template-schema'

type Props = {
  layerLabel: string
  guidance: TemplateLayer['guidance']
}

export function LayerGuidancePanel({ layerLabel, guidance }: Props) {
  return (
    <div className="rounded-md border border-dashed border-[color:var(--line-default)] bg-white p-3 text-sm">
      <p className="font-medium">Hilfe: {layerLabel}</p>
      <p className="mt-1 text-[color:var(--ink-muted)]">{guidance.generalDe}</p>
      {guidance.commonExamplesDe.length > 0 ? (
        <div className="mt-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
            Übliche Inhalte
          </p>
          <p className="text-[color:var(--ink-muted)]">{guidance.commonExamplesDe.join(', ')}</p>
        </div>
      ) : null}
      {guidance.industryDe ? (
        <div className="mt-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
            Branchenhinweis
          </p>
          <p className="text-[color:var(--ink-muted)]">{guidance.industryDe}</p>
          {guidance.industryExamplesDe.length > 0 ? (
            <p className="mt-1 text-[color:var(--ink-muted)]">
              Beispiele: {guidance.industryExamplesDe.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
