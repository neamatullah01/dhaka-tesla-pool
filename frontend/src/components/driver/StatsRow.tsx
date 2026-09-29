import { Banknote, Users, Leaf, TrendingUp } from "lucide-react";


export function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Earnings */}
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Today's Pool Earnings</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex flex-col relative z-10">
          <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">৳1,420</span>
          <span className="text-label-sm font-semibold text-success flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            +24% vs Solo Rides
          </span>
        </div>
      </div>

      {/* Passengers */}
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-fixed/5 rounded-full blur-xl group-hover:bg-secondary-fixed/10 transition-colors" />
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Passengers Shared Today</span>
          <div className="w-8 h-8 rounded-lg bg-secondary-fixed/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-secondary-fixed" />
          </div>
        </div>
        <div className="mt-4 flex flex-col relative z-10">
          <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">14</span>
          <span className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-2 font-medium">
            <Users className="w-3 h-3" />
            Avg 2.8 occupancy rate
          </span>
        </div>
      </div>

      {/* Energy */}
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors" />
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Total Energy Conserved</span>
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-success" />
          </div>
        </div>
        <div className="mt-4 flex flex-col relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">24.6</span>
            <span className="text-title-md text-on-surface-variant font-medium">kWh</span>
          </div>
          <span className="text-label-sm font-semibold text-success flex items-center gap-1 mt-2">
            <Leaf className="w-3 h-3" />
            19.2 kg CO2 Offset
          </span>
        </div>
      </div>
    </div>
  );
}
