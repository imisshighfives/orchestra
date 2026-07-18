export type AppMode = "demo" | "live";

export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Presentation mode"
      className="flex w-full rounded-md border border-slate-200 bg-slate-100 p-0.5"
    >
      <SegmentButton label="Demo" active={mode === "demo"} onClick={() => onChange("demo")} />
      <SegmentButton label="Live" active={mode === "live"} onClick={() => onChange("live")} />
    </div>
  );
}

function SegmentButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 flex-1 rounded-[5px] text-[13px] font-semibold transition-colors motion-reduce:transition-none ${
        active
          ? "bg-blue-50 text-navy-800 shadow-sm border border-blue-200"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
