import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Zone {
  id: string;
  name: string;
  order: number;
  corridorCode: string;
}

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Zone[] }>("/zones");
      return res.data;
    },
  });
}
