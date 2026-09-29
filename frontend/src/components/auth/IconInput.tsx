import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

export interface IconInputProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  prefixText?: string;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ label, icon: Icon, hint, error, prefixText, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={props.id}
            className="text-body-sm text-on-surface"
          >
            {label}
          </label>
          {hint && (
            <span className="text-label-sm text-on-surface-variant">
              {hint}
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          {Icon && (
            <Icon className="absolute left-4 w-[18px] h-[18px] text-on-surface-variant pointer-events-none" />
          )}
          {prefixText && (
            <span className="absolute left-4 text-body-md text-on-surface-variant pointer-events-none">
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full h-[42px] bg-surface-container-lowest text-on-surface text-body-md ${
              prefixText ? "pl-16" : Icon ? "pl-12" : "pl-4"
            } pr-4 py-2.5 rounded-lg border-0 outline-none placeholder:text-outline-variant focus:bg-surface-container focus:text-primary transition ${className || ""}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-label-sm text-error mt-1">{error}</span>
        )}
      </div>
    );
  }
);

IconInput.displayName = "IconInput";
