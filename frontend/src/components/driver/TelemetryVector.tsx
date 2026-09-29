import { Map } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";

export function TelemetryVector() {
  return (
    <SectionCard
      title="Live Corridor Telemetry Vector"
      right={<span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Dhaka Spine North-South Map</span>}
      className="h-full border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] bg-surface-container-low"
    >
      <div className="relative w-full h-[240px] md:h-[300px] rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-highest flex items-center justify-center group">
        <iframe 
          src="https://maps.google.com/maps?q=dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0 }} 
          allowFullScreen 
          aria-hidden="false" 
          tabIndex={0} 
        />

        {/* Overlay Info Box */}
        <div className="absolute bottom-4 left-4 right-4 bg-surface-container-low/90 backdrop-blur-md rounded-lg p-4 border border-outline-variant/30 flex justify-between items-center shadow-lg pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Live Location</span>
              <span className="text-body-sm text-on-surface-variant">Connected to network</span>
            </div>
          </div>
          <div className="hidden sm:block px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[9px] uppercase tracking-wider text-primary font-bold">
            Synced with Pilot
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
