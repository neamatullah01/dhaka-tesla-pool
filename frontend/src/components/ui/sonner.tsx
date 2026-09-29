"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-container-high/80 group-[.toaster]:text-on-surface group-[.toaster]:border group-[.toaster]:border-outline-variant/30 group-[.toaster]:shadow-2xl backdrop-blur-xl rounded-2xl font-label px-5 py-4 text-label-lg flex items-start gap-3",
          description: "group-[.toast]:text-on-surface-variant text-body-sm mt-1 font-normal",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-on-primary rounded-lg font-semibold px-4 py-2",
          cancelButton: "group-[.toast]:bg-surface-variant group-[.toast]:text-on-surface-variant rounded-lg font-semibold px-4 py-2",
          error: "group-[.toaster]:bg-error-container/80 group-[.toaster]:text-on-error-container group-[.toaster]:border-error/20",
          success: "group-[.toaster]:bg-primary-container/80 group-[.toaster]:text-on-primary-container group-[.toaster]:border-primary/20",
          warning: "group-[.toaster]:bg-secondary-container/80 group-[.toaster]:text-on-secondary-container group-[.toaster]:border-secondary/20",
          info: "group-[.toaster]:bg-surface-container-highest/80 group-[.toaster]:text-on-surface",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
