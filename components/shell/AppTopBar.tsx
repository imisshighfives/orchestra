import { patient } from "@/lib/transition-readiness/patient";

export const PATIENT_MRN = "SYN-004182";

export function AppTopBar() {
  return (
    <header className="shrink-0 bg-navy-900 px-4 py-1.5 text-white">
      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-navy-100/80">
        Patient Chart
      </p>
      <div className="flex flex-wrap items-baseline gap-x-2 text-[11.5px] text-navy-50">
        <span className="font-semibold">{patient.name}</span>
        <span className="text-navy-100/70">MRN: {PATIENT_MRN}</span>
        <span className="text-navy-100/70">{patient.location}</span>
      </div>
    </header>
  );
}
