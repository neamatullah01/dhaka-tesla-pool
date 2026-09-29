"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { AtSign, CheckCircle2, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { PasswordInput } from "./PasswordInput";
import { FormAlert } from "./FormAlert";
import { useAuthStore } from "@/store/auth.store";
import { ApiError } from "@/lib/api-client";
import { LoginInput } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/useLogin";

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const loginMutation = useLogin();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useFormContext<LoginInput>();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const role = useAuthStore.getState().user?.role;
      if (role === "DRIVER") router.replace("/driver/dashboard");
      else router.replace("/passenger/request-ride");
    }
  }, [isAuthenticated, isInitializing, router]);

  const onSubmit = (data: LoginInput) => {
    console.log(data);
    setErrorMessage("");
    loginMutation.mutate(data, {
      onError: (err: any) => {
        const apiErr = err as ApiError;
        const msg =
          apiErr.message ||
          (apiErr.status === 401
            ? "Invalid email or password"
            : "Something went wrong. Please try again.");
        toast.error(msg);
        setErrorMessage(msg);
      },
      onSuccess: () => {
        toast.success("Signed in successfully!");
      },
    });
  };

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const emailValue = form.watch("email");
  const isEmailValid = !form.formState.errors.email && emailValue?.length > 0;

  return (
    <div className="bg-surface-container-high/60 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-md flex flex-col gap-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Email
          </label>
          <div className="relative flex items-center">
            <AtSign className="absolute left-4 w-[18px] h-[18px] text-on-surface-variant pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!emailError}
              className="w-full h-[38px] bg-surface-container-lowest text-on-surface text-body-md pl-12 pr-10 py-2 rounded-lg border-0 outline-none placeholder-outline-variant focus:bg-surface-container focus:text-primary transition"
              {...form.register("email", {
                setValueAs: (v) =>
                  typeof v === "string" ? v.trim().toLowerCase() : v,
              })}
            />
            <CheckCircle2
              className={`absolute right-4 w-[15px] h-[15px] text-secondary-container transition-opacity duration-200 ${isEmailValid ? "opacity-100" : "opacity-0"}`}
            />
          </div>
          {emailError && (
            <span className="text-label-sm text-error mt-1">{emailError}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            {...form.register("password")}
          />
          {passwordError && (
            <span className="text-label-sm text-error mt-1">
              {passwordError}
            </span>
          )}
        </div>

        {/* Submit & Error */}
        <div className="flex flex-col gap-2 mt-2">
          <FormAlert message={errorMessage} />

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-[44px] bg-primary-container hover:bg-primary-fixed text-on-primary-container font-headline text-headline-sm font-semibold tracking-wide py-2 px-6 rounded-lg shadow-lg hover:shadow-primary-container/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-[20px] h-[20px] animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-[20px] h-[20px]" />
                Sign in
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bottom row */}
      <div className="flex justify-between items-center pt-1 text-body-sm">
        <span className="text-on-surface-variant">Don't have an account?</span>
        <Link
          href="/register"
          className="font-label text-label-md text-primary-container hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
