import { MOODS, type MoodDef } from "@/lib/moods";
import { cn } from "@/lib/utils";

export function MoodWheel({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const slice = 360 / MOODS.length;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative size-[280px] md:size-[320px]">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {MOODS.map((mood, i) => {
            const start = i * slice;
            const end = start + slice - 1.2;
            const active = selected === mood.id;
            return (
              <path
                key={mood.id}
                d={annularSlice(50, 50, 18, 48, start, end)}
                fill={mood.swatch}
                opacity={selected && !active ? 0.45 : 1}
                className="cursor-pointer transition-opacity duration-200"
                onClick={() => onSelect(mood.id)}
              />
            );
          })}
          <circle cx="50" cy="50" r="16" fill="#fff8f0" />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="max-w-[7.5rem] text-center">
            <p className="font-display text-base leading-tight text-ink">
              {MOODS.find((m) => m.id === selected)?.label ?? "Mood"}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
              turn the earth
            </p>
          </div>
        </div>
      </div>
      <div className="flex max-w-lg flex-wrap justify-center gap-2 px-4">
        {MOODS.map((mood) => (
          <MoodChip
            key={mood.id}
            mood={mood}
            active={selected === mood.id}
            onClick={() => onSelect(mood.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MoodChip({
  mood,
  active,
  onClick,
}: {
  mood: MoodDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium",
        active
          ? "border-ochre-dark bg-ochre text-cream"
          : "border-border bg-cream text-ink",
      )}
    >
      <span className="size-2.5 rounded-full" style={{ background: mood.swatch }} />
      {mood.label}
    </button>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function annularSlice(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const p0 = polar(cx, cy, r1, a0);
  const p1 = polar(cx, cy, r1, a1);
  const p2 = polar(cx, cy, r0, a1);
  const p3 = polar(cx, cy, r0, a0);
  return `M ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y} Z`;
}
