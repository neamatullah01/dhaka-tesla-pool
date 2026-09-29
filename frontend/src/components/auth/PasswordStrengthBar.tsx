export function PasswordStrengthBar({ strength = 0 }: { strength?: number }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className={`flex-1 h-[3px] rounded-full ${
            strength >= level ? "bg-primary-container" : "bg-surface-variant"
          }`}
        />
      ))}
      <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
        Min 8 characters
      </span>
    </div>
  );
}
