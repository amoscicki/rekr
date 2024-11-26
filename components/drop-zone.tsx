import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  id: string;
  parentId: string;
  isDragging: boolean;
  className?: string;
}

export function DropZone({
  id,
  parentId,
  isDragging,
  className,
}: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: "nest",
      parentId,
    },
  });

  if (!isDragging) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-8 rounded-lg transition-all border-2 border-dashed",
        isOver ? "opacity-100" : "opacity-50",
        className
      )}
      style={{
        background: isOver ? "rgba(127, 86, 217, 0.1)" : "transparent",
        borderColor: "rgb(127, 86, 217)",
      }}
    >
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Przeciągnij tutaj aby dodać jako element podrzędny
      </div>
    </div>
  );
}
