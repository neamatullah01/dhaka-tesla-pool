import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { RideRequestInput, RideEstimateInput } from "@/lib/validations/ride";
import { toast } from "sonner";

export interface RideEstimate {
  distanceMeters: number;
  farePaisa: number;
  poolEligible: boolean;
}

export interface Ride {
  id: string;
  createdAt: string;
  status: "REQUESTED" | "MATCHED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED";
  requestedSeats: number;
  paymentMethod: "CASH" | "TESLAPAY";
  pickupZoneId: string;
  destinationZoneId: string;
  pickupZone?: { id: string; name: string; order: number };
  destinationZone?: { id: string; name: string; order: number };
  pool?: {
    vehicle?: { name: string };
    driver?: { name: string; plateNo?: string };
  };
  amountPaisa?: number;
  baseFarePaisa?: number;
  distanceFarePaisa?: number;
  poolDiscountPaisa?: number;
  totalFarePaisa?: number;
  fare?: {
    baseFarePaisa: number;
    distanceChargePaisa: number;
    discountPaisa?: number;
    totalPaisa: number;
  };
}

export function useRideEstimate(input: RideEstimateInput, enabled: boolean) {
  return useQuery({
    queryKey: ["rideEstimate", input],
    queryFn: async () => {
      const res = await apiClient.post<{ success: boolean; data: RideEstimate }>(
        "/rides/estimate",
        input
      );
      return res.data;
    },
    enabled: enabled && !!input.pickupZoneId && !!input.destinationZoneId,
    staleTime: 60 * 1000,
  });
}

export function useRequestRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RideRequestInput) => {
      const res = await apiClient.post<{ success: boolean; data: Ride }>("/rides", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentRide"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success("Ride requested successfully!");
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error(error.message || "You already have an active ride or pool capacity is full");
      } else {
        toast.error(error.message || "Failed to request ride");
      }
    }
  });
}

export function useCurrentRide() {
  return useQuery({
    queryKey: ["currentRide"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Ride }>("/rides/current");
        if (res.data && res.data.status === "CANCELLED") {
          return null; // Treat a cancelled ride as "no active ride" so the passenger can request again
        }
        return res.data;
      } catch (e: any) {
        if (e.status === 404) return null;
        throw e;
      }
    },
    retry: false,
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      const status = query.state.data.status;
      if (["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(status)) {
        return 3000;
      }
      return false;
    }
  });
}

export function useRideDetails(rideId?: string) {
  return useQuery({
    queryKey: ["ride", rideId],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Ride }>(`/rides/${rideId}`);
      return res.data;
    },
    enabled: !!rideId,
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      const status = query.state.data.status;
      if (["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(status)) {
        return 3000;
      }
      return false;
    }
  });
}

export function useCancelRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/rides/${rideId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      // Optimistically clear the current ride to instantly switch the UI back
      queryClient.setQueryData(["currentRide"], null);
      queryClient.invalidateQueries({ queryKey: ["currentRide"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success("Ride cancelled successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to cancel ride");
    }
  });
}

export function useRideHistory() {
  return useQuery({
    queryKey: ["rides"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Ride[] }>("/rides");
      return res.data;
    },
  });
}

export interface ActivePoolData {
  id: string;
  driverName: string;
  currentLocation: string;
  lastDestination: string;
  availableSeats: number;
  totalSeats: number;
}

export function useActivePools(pickupZoneId?: string, destinationZoneId?: string) {
  return useQuery({
    queryKey: ["activePools", pickupZoneId, destinationZoneId],
    queryFn: async () => {
      if (!pickupZoneId || !destinationZoneId) return [];
      const res = await apiClient.get<{ success: boolean; data: ActivePoolData[] }>(
        `/passenger/pools/active?pickupZoneId=${pickupZoneId}&destinationZoneId=${destinationZoneId}`
      );
      return res.data;
    },
    enabled: !!pickupZoneId && !!destinationZoneId,
    refetchInterval: 10000,
  });
}

export function useJoinPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ poolId, ...data }: { poolId: string } & RideRequestInput) => {
      const res = await apiClient.post<{ success: boolean; data: Ride }>(`/passenger/pools/${poolId}/join`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentRide"] });
      queryClient.invalidateQueries({ queryKey: ["activePools"] });
      toast.success("Successfully joined the pool!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to join pool");
    }
  });
}
