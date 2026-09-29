import { Zap } from "lucide-react";

interface AuthHeadingProps {
  title: string;
  subtitle: string;
}

export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-20 h-20 rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/40 shrink-0">
        <Zap className="h-[40px] w-[40px] text-primary-container" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary-container ring-4 ring-surface-container-low" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-headline-xl-mobile md:text-headline-lg font-bold text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-body-lg text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );
}
