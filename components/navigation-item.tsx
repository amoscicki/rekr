"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationItem as NavigationItemType } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  item: NavigationItemType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  isChild?: boolean;
}

export function NavigationItem({
  item,
  onEdit,
  onDelete,
  onAddChild,
  isChild = false,
}: NavigationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: item.id,
    data: {
      type: "item",
      item,
      isChild,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50",
        isChild && "ml-16",
        isOver && [
          "after:absolute after:left-16 after:-bottom-8 after:h-8 after:w-[calc(100%-4rem)]",
          "after:border-2 after:border-dashed after:border-primary/50 after:rounded-lg",
          "after:bg-primary/5",
        ]
      )}
      data-type="drop-zone"
    >
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab p-2"
          aria-label="move item"
        >
          <Move className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <div className="font-medium">{item.label}</div>
          {item.url && (
            <div className="text-sm text-muted-foreground">{item.url}</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDelete(item.id)}>
            Usuń
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddChild(item.id)}
          >
            Dodaj pozycję menu
          </Button>
        </div>
      </div>

      {item.children?.map((child) => (
        <NavigationItem
          key={child.id}
          item={child}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          isChild={true}
        />
      ))}
    </div>
  );
}
