"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationItem as NavigationItemType } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { DropZone } from "@/components/drop-zone";
import { NavigationForm } from "@/components/navigation-form";
import { EditSlot } from "@/components/edit-slot";

interface NavigationItemProps {
  item: NavigationItemType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  isDragging: boolean;
  depth?: number;
  isEditing?: boolean;
  onSubmit?: (data: NavigationFormData) => void;
  onCancelEdit?: () => void;
}

export function NavigationItem({
  item,
  onEdit,
  onDelete,
  onAddChild,
  isDragging,
  depth = 0,
  isEditing = false,
  onSubmit,
  onCancelEdit,
}: NavigationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemClasses = cn(
    "rounded-lg border bg-background",
    depth > 0 && `ml-${Math.min(depth * 16, 64)}`
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative space-y-2", isItemDragging && "opacity-50")}
    >
      <EditSlot mode={isEditing ? "update" : "insert"} className={itemClasses}>
        {isEditing ? (
          <NavigationForm
            mode="update"
            initialData={item}
            onSubmit={onSubmit!}
            onCancel={onCancelEdit!}
          />
        ) : (
          <div className="flex items-center gap-4 p-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                Usuń
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item.id)}
              >
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
        )}
      </EditSlot>

      <div
        className={cn(
          "space-y-2",
          depth > 0 && `ml-${Math.min(depth * 16, 64)}`
        )}
      >
        {item.children?.map((child) => (
          <NavigationItem
            key={child.id}
            item={child}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            isDragging={isDragging}
            depth={depth + 1}
            isEditing={false}
            onSubmit={onSubmit}
            onCancelEdit={onCancelEdit}
          />
        ))}

        {!isItemDragging && (
          <DropZone
            id={`${item.id}-as-child`}
            parentId={item.id}
            isDragging={isDragging}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
