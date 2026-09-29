"use client";

import { useState } from "react";
import { UserRound, AtSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/useRegister";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthHeading } from "./AuthHeading";
import { RoleSelector } from "./RoleSelector";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthBar } from "./PasswordStrengthBar";

export function RegisterCard() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();
  const [terms, setTerms] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "PASSENGER",
    },
  });

  const role = watch("role");
  const password = watch("password") || "";

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 4) return 1;
    if (pass.length < 6) return 2;
    if (pass.length < 8) return 3;
    return 4;
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = (data: RegisterInput) => {
    if (!terms) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    
    registerUser(data, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Account created successfully. Please login.");
          router.push("/login");
        } else {
          toast.error(res.message || "Registration failed. Please try again.");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    });
  };

  return (
    <div className="relative overflow-hidden bg-surface-container-low rounded-xl shadow-xl p-4 md:p-10 max-w-[864px] mx-auto w-full">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80" />

      <div className="flex flex-col gap-8 relative z-10">
        <AuthHeading
          title="Create your account"
          subtitle="Join Dhaka Tesla Pool and start sharing rides."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <RoleSelector value={role} onChange={(val) => setValue("role", val)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <IconInput
              id="fullName"
              label="Full name"
              icon={UserRound}
              placeholder="Nusrat Jahan"
              {...register("name")}
              error={errors.name?.message}
            />
            <IconInput
              id="email"
              label="Email"
              icon={AtSign}
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <IconInput
              id="phone"
              label="Phone"
              hint="Optional"
              prefixText="+880"
              type="tel"
              placeholder="1712 345678"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <div>
              <div className="mb-1">
                <label
                  htmlFor="password"
                  className="text-body-sm text-on-surface"
                >
                  Password
                </label>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••••••"
                className="!h-[42px] !py-2.5"
                {...register("password")}
                error={errors.password?.message}
              />
              <PasswordStrengthBar strength={passwordStrength} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(c) => setTerms(c as boolean)}
              className="mt-0.5 w-[20px] h-[20px] rounded-sm bg-surface-container-lowest border border-outline data-[state=checked]:bg-primary-container data-[state=checked]:border-primary-container data-[state=checked]:text-black"
            />
            <label htmlFor="terms" className="text-body-sm text-on-surface-variant cursor-pointer select-none">
              I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[44px] bg-primary-container hover:bg-primary-fixed text-on-primary-container font-headline text-headline-sm font-semibold tracking-wide py-2 px-6 rounded-lg shadow-lg hover:shadow-primary-container/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Bottom row */}
        <div className="flex justify-between items-center pt-1 text-body-sm">
          <span className="text-on-surface-variant">Already have an account?</span>
          <Link
            href="/login"
            className="font-label text-label-md text-primary-container hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
