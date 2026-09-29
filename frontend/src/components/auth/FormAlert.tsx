import { ShieldAlert } from "lucide-react";

interface FormAlertProps {
  message: string;
}

export function FormAlert({ message }: FormAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 p-2 rounded bg-error-container/40 text-on-error-container text-body-sm"
    >
      <ShieldAlert className="w-[15px] h-[15px] text-error shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
