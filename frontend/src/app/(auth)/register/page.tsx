import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterCard } from "@/components/auth/RegisterCard";

export default function RegisterPage() {
  return (
    <AuthShell className="max-w-4xl">
      <RegisterCard />
    </AuthShell>
  );
}
