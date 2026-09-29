import { useState } from "react";
import { Car, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { useCreateVehicle } from "@/hooks/useDriver";

export function CreateVehicleForm() {
  const [plateNo, setPlateNo] = useState("");
  const createVehicle = useCreateVehicle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNo.trim()) return;
    createVehicle.mutate({ plateNo, model: "Bullet", capacity: 3 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md">
        <SectionCard title="Register Vehicle" icon={Car}>
          <p className="text-body-sm text-on-surface-variant mb-6">
            You need to register a vehicle before you can start accepting pool requests.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="plateNo" className="text-label-md font-bold text-on-surface">
                License Plate Number
              </label>
              <input
                id="plateNo"
                type="text"
                value={plateNo}
                onChange={(e) => setPlateNo(e.target.value)}
                placeholder="e.g. DHK-1234"
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-label-md font-bold text-on-surface">
                Vehicle Model
              </label>
              <div className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-body-lg text-on-surface-variant cursor-not-allowed">
                Tesla Bullet (Fixed)
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface">
                Capacity
              </label>
              <div className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-body-lg text-on-surface-variant cursor-not-allowed">
                3 Seats (Fixed)
              </div>
            </div>

            <button
              type="submit"
              disabled={createVehicle.isPending || !plateNo.trim()}
              className="mt-4 w-full bg-primary-container text-on-primary-container font-bold text-label-lg py-4 rounded-xl flex items-center justify-center gap-2 transition hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] disabled:opacity-50"
            >
              {createVehicle.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Car className="w-5 h-5" />}
              {createVehicle.isPending ? "Registering..." : "Register Vehicle"}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
