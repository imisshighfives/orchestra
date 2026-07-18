import { Info } from "lucide-react";

export function SystemResponseBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-md border border-navy-100 bg-navy-50 px-3 py-2">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-700" aria-hidden />
      <p className="text-[12.5px] leading-snug text-navy-800">{message}</p>
    </div>
  );
}
