import { cn } from "@/lib/utils";

export function VinylDisc({
  artUrl,
  spinning,
  sizeClass,
  onClick,
  interactive = true,
}: {
  artUrl: string;
  spinning: boolean;
  sizeClass?: string;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const inner = (
    <>
      <div className="vinyl-disc-spin">
        <div
          className="vinyl-label"
          style={{
            backgroundImage: artUrl ? `url(${artUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <span className="vinyl-spindle" />
      </div>
      <span className="vinyl-highlight" />
    </>
  );

  const cls = cn("vinyl-disc", spinning && "is-playing", sizeClass);

  if (!interactive) {
    return <div className={cls}>{inner}</div>;
  }

  return (
    <button type="button" onClick={onClick} aria-label={spinning ? "Pause" : "Play"} className={cls}>
      {inner}
    </button>
  );
}

export function Tonearm({ playing }: { playing: boolean }) {
  return (
    <svg
      className={cn("tonearm", playing && "is-playing")}
      viewBox="0 0 120 180"
      fill="none"
      aria-hidden="true"
    >
      <rect x="86" y="8" width="22" height="18" rx="3" fill="#f4f0ea" stroke="#cfc6ba" />
      <path d="M97 26 L40 150" stroke="#f7f3ee" strokeWidth="7" strokeLinecap="round" />
      <path d="M97 26 L40 150" stroke="#d9d0c4" strokeWidth="2" strokeLinecap="round" />
      <rect
        x="28"
        y="146"
        width="22"
        height="18"
        rx="2"
        fill="#f7f3ee"
        stroke="#cfc6ba"
        transform="rotate(-28 39 155)"
      />
      <circle cx="97" cy="18" r="5" fill="#c87d55" />
    </svg>
  );
}
