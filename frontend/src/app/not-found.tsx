import Link from "next/link";
import { Compass, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden z-50">
      {/* Background glow blobs */}
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-error-container/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-[600px] text-center">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-error/20 blur-3xl rounded-full group-hover:bg-error/30 transition-all duration-700" />
          <Compass className="w-32 h-32 text-error relative z-10 animate-[spin_10s_linear_infinite]" strokeWidth={1.5} />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <span className="text-[120px] font-black font-headline text-on-surface/90 tracking-tighter mix-blend-overlay">
              404
            </span>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold font-headline text-on-surface mb-4 tracking-tight whitespace-nowrap">
          Lost in traffic?
        </h1>
        
        <p className="text-body-lg text-on-surface-variant mb-10 w-[500px]">
          It looks like the route you're looking for doesn't exist on our map. Let's get you back on track to finding your next ride.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black rounded-full font-bold text-label-lg shadow-[0_8px_20px_rgba(var(--color-primary),0.25)] hover:shadow-[0_8px_25px_rgba(var(--color-primary),0.35)] hover:-translate-y-1 transition-all duration-300"
        >
          <MoveLeft className="w-5 h-5" />
          Return to Base
        </Link>
      </div>
    </div>
  );
}
