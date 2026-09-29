"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrandPanel } from "./BrandPanel";
import { LoginForm } from "./LoginForm";
import { LoginInput, loginSchema } from "@/lib/validations/auth";

export function LoginCard() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const handleFill = (email: string, pass: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", pass, { shouldValidate: true });
  };

  return (
    <div className="relative overflow-hidden bg-surface-container-low rounded-xl shadow-xl p-4 md:p-10 z-10 w-full">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80" />

      <FormProvider {...form}>
        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <BrandPanel onFill={handleFill} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-7">
            <LoginForm />
          </div>
        </div>
      </FormProvider>
    </div>
  );
}
