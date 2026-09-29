import { LucideIcon } from "lucide-react";

interface RoleOptionProps {
  selected: boolean;
  onSelect: () => void;
  icon: LucideIcon;
  title: string;
  tag: string;
  description: string;
  note: string;
}

export function RoleOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  tag,
  description,
  note,
}: RoleOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`text-left rounded-lg p-4 flex flex-col gap-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container ${
        selected
          ? "bg-surface-container-high"
          : "bg-surface-container hover:bg-surface-container-high/70"
      }`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-[36px] h-[36px] rounded bg-surface-container-lowest flex items-center justify-center shrink-0">
            <Icon
              className={`w-[20px] h-[20px] ${
                selected ? "text-primary-container" : "text-secondary-fixed"
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-headline-sm text-on-surface">
              {title}
            </span>
            <span
              className={`text-label-sm font-label uppercase ${
                selected ? "text-primary-container" : "text-on-surface-variant"
              }`}
            >
              {tag}
            </span>
          </div>
        </div>
        <div
          className={`w-[20px] h-[20px] rounded-full shrink-0 flex items-center justify-center ${
            selected ? "bg-primary-container" : "bg-surface-variant"
          }`}
        >
          {selected && (
            <div className="w-[6px] h-[6px] rounded-full bg-surface-container-lowest" />
          )}
        </div>
      </div>
      <p className="text-body-sm text-on-surface-variant line-clamp-3">
        {description}
      </p>
      <div className="border-t border-outline-variant/40 pt-2 text-label-sm text-on-surface-variant w-full">
        {note}
      </div>
    </button>
  );
}
