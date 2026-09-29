import { Zap, ArrowRight, Car, UserRound, User } from "lucide-react";

interface DemoAccountsProps {
  onFill?: (email: string, pass: string) => void;
}

const DEMO_PASSWORD = "password123";

const ACCOUNTS = [
  {
    name: "Jashim",
    role: "Driver",
    subtitle: "Bullet · 3 seats",
    icon: Car,
    iconColor: "text-primary-fixed",
    email: "jashim@example.com",
  },
  {
    name: "Nusrat",
    role: "Passenger",
    subtitle: "Banani → Mohakhali",
    icon: UserRound,
    iconColor: "text-secondary-fixed",
    email: "nusrat@example.com",
  },
  {
    name: "Rafiq",
    role: "Passenger",
    subtitle: "Banani → Gulshan 1",
    icon: User,
    iconColor: "text-on-surface-variant",
    email: "rafiq@example.com",
  },
  {
    name: "Shirin",
    role: "Passenger",
    subtitle: "Banani → Gulshan 2",
    icon: User,
    iconColor: "text-secondary-container",
    email: "shirin@example.com",
  },
];

export function DemoAccounts({ onFill }: DemoAccountsProps) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {/* Section label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-secondary-fixed" />
          <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">
            Demo Accounts
          </span>
        </div>
        <span className="text-label-sm text-secondary-container">
          One-click fill
        </span>
      </div>

      {/* Account rows */}
      <div className="flex flex-col gap-1">
        {ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.email}
              type="button"
              className="w-full text-left bg-surface-container hover:bg-surface-container-high transition p-2 rounded-lg flex items-center justify-between group"
              onClick={() => onFill?.(acc.email, DEMO_PASSWORD)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${acc.iconColor}`} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-label-md text-on-surface group-hover:text-primary transition-colors">
                    {acc.name} <span className="font-normal text-on-surface-variant ml-1">({acc.role})</span>
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    {acc.subtitle}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-[15px] h-[15px] text-on-surface-variant group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
