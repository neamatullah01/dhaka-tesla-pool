import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden z-50">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000 delay-1000" />

      <div className="relative z-10 flex flex-col items-center gap-6 p-8 w-[500px] text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        
        <div className="flex flex-col items-center gap-2 w-full">
          <h2 className="text-2xl font-bold font-headline text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container whitespace-nowrap">
            Preparing your experience
          </h2>
          <p className="text-body-md text-on-surface-variant w-full text-center animate-pulse">
            Connecting to the Dhaka Tesla Pool network...
          </p>
        </div>
      </div>
    </div>
  );
}
