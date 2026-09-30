import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Ride } from "./useRides";

export interface Vehicle {
  id: string;
  model: string;
  plateNo: string;
  capacity: number;
  status: "OFFLINE" | "ONLINE" | "IN_TRIP";
}

export interface DriverRideRequest {
  id: string;
  pickupZoneId: string;
  destinationZoneId: string;
  pickupZone?: { id: string; name: string; corridorCode: string; routeOrder: number };
  destinationZone?: { id: string; name: string; corridorCode: string; routeOrder: number };
  passenger: { id: string; name: string };
  seatsRequested: number;
  totalFarePaisa: number;
  status: string;
  distanceMeters?: number; // Might not be returned directly, but useful if calculated
}

export interface DriverPool {
  id: string;
  status: "OPEN" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED";
  corridorCode: string;
  totalCapacity: number;
  seatsReserved: number;
  originZone: { id: string; name: string };
  members: {
    id: string;
    rideRequestId: string;
    seatsAllocated: number;
    status: string;
    rideRequest: DriverRideRequest;
  }[];
}

export function useDriverVehicle() {
  return useQuery({
    queryKey: ["driverVehicle"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Vehicle }>("/driver/vehicle");
        return res.data;
      } catch (e: any) {
        if (e.status === 404) return null;
        throw e;
      }
    },
    refetchInterval: 5000 // Always poll for fresh vehicle data
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { model?: string; plateNo: string; capacity?: number }) => {
      const res = await apiClient.post<{ success: boolean; data: Vehicle }>("/driver/vehicle", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      toast.success("Vehicle registered successfully");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to register vehicle")
  });
}

export function useDriverOnline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ success: boolean; data: Vehicle }>("/driver/online");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      toast.success("You are now online");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to go online")
  });
}

export function useDriverOffline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ success: boolean; data: Vehicle }>("/driver/offline");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      toast.success("You are now offline");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to go offline")
  });
}

export function useDriverRequests() {
  return useQuery({
    queryKey: ["driverRequests"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: DriverRideRequest[] }>("/driver/requests");
      return res.data;
    },
    refetchInterval: 5000 // Poll for new requests
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/driver/requests/${requestId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverRequests"] });
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      toast.success("Request accepted");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to accept request")
  });
}

export function useCurrentPool() {
  return useQuery({
    queryKey: ["currentPool"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: DriverPool }>("/driver/pools/current");
        return res.data;
      } catch (e: any) {
        if (e.status === 404) return null;
        throw e;
      }
    },
    refetchInterval: 5000 // Constantly poll so dispatcher updates or cancellations appear instantly
  });
}

export function useDriverArrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (poolId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/driver/pools/${poolId}/arrive`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      toast.success("Marked as arrived");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to arrive")
  });
}

export function useDriverStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (poolId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/driver/pools/${poolId}/start`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      toast.success("Trip started");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to start trip")
  });
}

export function useUpdateRideStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rideId, status }: { rideId: string; status: 'DRIVER_ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED' }) => {
      const res = await apiClient.patch<{ success: boolean; data: any }>(`/driver/rides/${rideId}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      if (variables.status === 'COMPLETED') {
        queryClient.invalidateQueries({ queryKey: ["driverHistory"] });
        toast.success("Passenger dropped off and payment received!");
      } else if (variables.status === 'DRIVER_ARRIVED') {
        toast.success("Driver arrived at pickup zone");
      } else if (variables.status === 'CANCELLED') {
        toast.success("Passenger ride cancelled");
      } else {
        toast.success("Trip started for passenger");
      }
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to update status")
  });
}

export function useCompletePassenger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/driver/rides/${rideId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      queryClient.invalidateQueries({ queryKey: ["driverVehicle"] });
      toast.success("Passenger trip completed");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to complete passenger trip")
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/driver/rides/${rideId}/payment/confirm`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPool"] });
      queryClient.invalidateQueries({ queryKey: ["driverHistory"] });
      toast.success("Payment confirmed");
    },
    onError: (error: ApiError) => toast.error(error.message || "Failed to confirm payment")
  });
}

export function useDriverHistory() {
  return useQuery({
    queryKey: ["driverHistory"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Ride[] }>("/driver/rides");
      return res.data;
    }
  });
}
