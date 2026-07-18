import { patient } from "@/lib/transition-readiness/patient";

export function PatientHeader({ showMriTag }: { showMriTag: boolean }) {
  return (
    <header className="border-b border-slate-200 px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-[17px] font-semibold text-slate-900">{patient.name}</h1>
        <span className="text-xs font-medium text-slate-500">{patient.location}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-600">
        <span>{patient.age}</span>
        <Dot />
        <span>{patient.weight}</span>
        <Dot />
        <span>{patient.postOpTag}</span>
      </div>
      {showMriTag ? (
        <div className="mt-2 inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[12px] font-semibold tracking-wide text-amber-800">
          {patient.transitionTag}
        </div>
      ) : null}
    </header>
  );
}

function Dot() {
  return <span aria-hidden className="text-slate-300">·</span>;
}
