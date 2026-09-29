import { ReactNode } from "react";
import { Zap } from "lucide-react";

export function AuthShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Glow blobs */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-12 w-64 h-64 rounded-full bg-secondary-container/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full px-4 lg:px-12 py-4 flex items-center border-b border-surface-container-high/40 relative z-10">
        <div className="w-[28px] h-[28px] rounded bg-surface-container-high flex items-center justify-center shrink-0">
          <Zap className="h-[14px] w-[14px] text-primary-container" />
        </div>
        <div className="ml-4 font-headline text-headline-sm text-primary tracking-tight">
          Dhaka Tesla Pool
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
        <div className={`w-full relative py-4 ${className || "max-w-5xl"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
