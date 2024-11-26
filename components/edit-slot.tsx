import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface EditSlotProps {
  children: React.ReactNode;
  className?: string;
  mode: "update" | "insert";
}

export function EditSlot({ children, className, mode }: EditSlotProps) {
  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      {children}
    </div>
  );
}
