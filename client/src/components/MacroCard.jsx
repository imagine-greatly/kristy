import { fmt } from '../lib/format.js';

const COLUMNS = [
  { key: 'calories', label: 'Cal', unit: '' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

export default function MacroCard({ macros, insight, isEstimate, estimateNote }) {
  if (!macros) return null;
  const note = estimateNote || insight;
  return (
    <div className="macro-card">
      {isEstimate && <div className="macro-card__estimate">~ estimate</div>}
      <div className="macro-card__grid">
        {COLUMNS.map((col) => (
          <div className="macro-col" key={col.key}>
            <span className="macro-col__label">{col.label}</span>
            <span className="macro-col__value">
              {fmt(macros[col.key])}
              {col.unit && <span className="macro-col__unit">{col.unit}</span>}
            </span>
          </div>
        ))}
      </div>
      {note ? <div className="macro-card__insight">{note}</div> : null}
    </div>
  );
}
