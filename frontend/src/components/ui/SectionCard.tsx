import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: ElementType;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  icon: Icon,
  right,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-low rounded-xl p-6 md:p-8 shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
              <Icon className="w-[18px] h-[18px] text-primary-container" />
            </div>
          )}
          <h2 className="font-headline text-headline-md text-on-surface">
            {title}
          </h2>
        </div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}
