import { PRIORITIES } from "../constants/priorities";


// const COLORS: Record<Priority, string> = {
//   [priorities.LOW]: 'bg-green-600',
//   [priorities.MEDIUM]: 'bg-yellow-500',
//   [priorities.HIGH]: 'bg-orange-500',
//   [priorities.URGENT]: 'bg-red-600',
// };

interface Props {
    priority: (typeof PRIORITIES) [keyof typeof PRIORITIES]
}

export function PriorityBadge({ priority }: Props) {
    const { label, color } = priority

  return (
    <div className="inline-flex flex items-center justify-center gap-x-2.5 px-3 py-1 border border-slate-200 rounded-full bg-white hover:cursor-pointer">
      <div className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>
    </div>
  );
}