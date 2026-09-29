"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1 w-full">
      <div className="relative flex items-center w-full">
        <KeyRound className="absolute left-4 w-[18px] h-[18px] text-on-surface-variant pointer-events-none" />
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full h-[38px] bg-surface-container-lowest text-on-surface text-body-md pl-12 pr-12 py-2 rounded-lg border-0 outline-none placeholder-outline-variant focus:bg-surface-container focus:text-primary transition ${className || ""}`}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 w-[15px] h-[15px] text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center top-1/2 -translate-y-1/2"
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff className="w-full h-full" /> : <Eye className="w-full h-full" />}
        </button>
      </div>
      {error && (
        <span className="text-label-sm text-error mt-1 inline-block">{error}</span>
      )}
    </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
