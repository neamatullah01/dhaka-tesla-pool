import { z } from "zod";

export const rideEstimateSchema = z.object({
  pickupZoneId: z.string().min(1, "Pickup zone is required"),
  destinationZoneId: z.string().min(1, "Destination zone is required"),
  requestedSeats: z.number().int().min(1).max(3),
});

export type RideEstimateInput = z.infer<typeof rideEstimateSchema>;

export const rideRequestSchema = rideEstimateSchema.extend({
  paymentMethod: z.enum(["CASH", "TESLAPAY"]),
});

export type RideRequestInput = z.infer<typeof rideRequestSchema>;
