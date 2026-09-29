"use client";

import { useLogout } from "@/hooks/useLogout";

export default function RequestRidePage() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="p-4 flex flex-col gap-4 items-start">
      <h1 className="text-2xl font-bold">Request a Ride</h1>
      <button 
        onClick={() => logout()} 
        disabled={isPending}
        className="px-4 py-2 bg-error text-on-error rounded-lg shadow disabled:opacity-50"
      >
        {isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
