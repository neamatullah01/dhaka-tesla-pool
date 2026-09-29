import { Users, CarFront } from "lucide-react";
import { RoleOption } from "./RoleOption";

interface RoleSelectorProps {
  value: "PASSENGER" | "DRIVER";
  onChange: (role: "PASSENGER" | "DRIVER") => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <div className="text-label-sm font-label uppercase tracking-wider text-on-surface-variant mb-2">
        I want to join as
      </div>
      <div
        role="radiogroup"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <RoleOption
          selected={value === "PASSENGER"}
          onSelect={() => onChange("PASSENGER")}
          icon={Users}
          title="Passenger"
          tag="RIDER"
          description="Request rides, share a Bullet with others, and pay only your own fare."
          note="1 active ride at a time"
        />
        <RoleOption
          selected={value === "DRIVER"}
          onSelect={() => onChange("DRIVER")}
          icon={CarFront}
          title="Driver"
          tag="BULLET PILOT"
          description="Manage your vehicle, accept ride requests, and run shared pools."
          note="1 active pool at a time"
        />
      </div>
    </div>
  );
}
