import { CarFront, MapPin, Flag } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionCard } from "@/components/ui/SectionCard";
import { ZoneField } from "./ZoneField";
import { ZoneCorridor } from "./ZoneCorridor";
import { SeatSelector } from "./SeatSelector";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { rideRequestSchema, RideRequestInput } from "@/lib/validations/ride";
import { toast } from "sonner";
import { Zone } from "@/hooks/useZones";

interface RideRequestCardProps {
  onSubmit: (data: RideRequestInput) => void;
  formValues: Partial<RideRequestInput>;
  onValuesChange: (values: Partial<RideRequestInput>) => void;
  zones: Zone[];
}

export function RideRequestCard({ onSubmit, formValues, onValuesChange, zones }: RideRequestCardProps) {
  const sortedZones = [...zones].sort((a, b) => a.order - b.order);

  const form = useForm<RideRequestInput>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      pickupZoneId: "",
      destinationZoneId: "",
      requestedSeats: 1,
      paymentMethod: "CASH",
      ...formValues
    },
  });

  const { handleSubmit, control, watch, formState: { errors } } = form;
  const pickupZoneId = watch("pickupZoneId");
  const destinationZoneId = watch("destinationZoneId");

  // Call onValuesChange whenever values change so the page can update estimate
  const subscription = watch((value) => {
    onValuesChange(value as Partial<RideRequestInput>);
  });

  const handleFormSubmit = (data: RideRequestInput) => {
    if (data.pickupZoneId === data.destinationZoneId) {
      toast.error("Pickup and destination must be different");
      return;
    }
    onSubmit(data);
  };

  const pickupZone = sortedZones.find(z => z.id === pickupZoneId);
  const destinationZone = sortedZones.find(z => z.id === destinationZoneId);

  const pickupOptions = sortedZones;

  const destinationOptions = pickupZone
    ? sortedZones.filter((z) => z.id !== pickupZoneId && z.corridorCode === pickupZone.corridorCode)
    : sortedZones;

  return (
    <SectionCard 
      title="Request a ride" 
      icon={CarFront}
    >
      <div className="-mt-5 mb-6 text-label-sm text-on-surface-variant">Shared Bullet · 3 seats</div>
      
      <form id="ride-request-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="pickupZoneId"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <ZoneField
                  label="Pickup zone"
                  icon={MapPin}
                  placeholder="Select pickup zone"
                  options={pickupOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {errors.pickupZoneId && <span className="text-error text-label-sm">{errors.pickupZoneId.message}</span>}
              </div>
            )}
          />
          <Controller
            control={control}
            name="destinationZoneId"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <ZoneField
                  label="Destination zone"
                  icon={Flag}
                  iconClassName="text-black"
                  placeholder="Select destination zone"
                  options={destinationOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {errors.destinationZoneId && <span className="text-error text-label-sm">{errors.destinationZoneId.message}</span>}
              </div>
            )}
          />
        </div>

        <ZoneCorridor 
          zones={sortedZones} 
          pickupId={pickupZoneId} 
          destinationId={destinationZoneId} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="requestedSeats"
            render={({ field }) => (
              <SeatSelector value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <PaymentMethodSelector value={field.value as any} onChange={field.onChange} />
            )}
          />
        </div>
      </form>
    </SectionCard>
  );
}
