import { ElementType } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ZoneOption {
  id: string;
  name: string;
  order: number;
}

interface ZoneFieldProps {
  label: string;
  icon: ElementType;
  iconClassName?: string;
  value?: string;
  onChange?: (val: string) => void;
  options: ZoneOption[];
  placeholder: string;
}

export function ZoneField({
  label,
  icon: Icon,
  iconClassName,
  value,
  onChange,
  options,
  placeholder,
}: ZoneFieldProps) {
  const selectedZone = options.find((opt) => opt.id === value);

  return (
    <div className="flex flex-col gap-1">
      <Label className="flex items-center gap-2 text-label-md text-on-surface-variant mb-2">
        <Icon className={`w-[14px] h-[14px] ${iconClassName || "text-primary-container"}`} aria-hidden="true" />
        {label}
      </Label>
      <Select value={value ?? undefined} onValueChange={(val) => val && onChange?.(val)}>
        <SelectTrigger className="w-full h-12 bg-surface-container text-on-surface text-body-lg px-4 rounded-lg border-0 hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary-container focus:ring-offset-0">
          <SelectValue placeholder={placeholder}>
            {selectedZone?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-surface-container-high border-0 rounded-lg text-on-surface">
          {options.map((opt) => (
            <SelectItem 
              key={opt.id} 
              value={opt.id}
              className="focus:bg-surface-variant focus:text-primary-container data-[state=checked]:text-primary-container data-[state=checked]:bg-surface-variant/50 cursor-pointer"
            >
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
