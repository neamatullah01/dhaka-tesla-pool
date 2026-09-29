import { AuthShell } from "@/components/auth/AuthShell";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginCard />
    </AuthShell>
  );
}
