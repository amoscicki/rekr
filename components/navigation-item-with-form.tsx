import { NavigationItem } from "./navigation-item";
import { NavigationForm } from "./navigation-form";
import {
  NavigationFormData,
  NavigationItem as NavigationItemType,
} from "@/types/navigation";

interface NavigationItemWithFormProps {
  item: NavigationItemType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  isDragging: boolean;
  editingItemId: string | null;
  addingChildToId: string | null;
  onSubmit: (data: NavigationFormData) => void;
  onCancel: () => void;
  depth: number;
}

export function NavigationItemWithForm({
  item,
  onEdit,
  onDelete,
  onAddChild,
  isDragging,
  editingItemId,
  addingChildToId,
  onSubmit,
  onCancel,
  depth,
}: NavigationItemWithFormProps) {
  const isEditing = editingItemId === item.id;
  const isAddingChild = addingChildToId === item.id;

  return (
    <div className="space-y-2">
      <NavigationItem
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChild={onAddChild}
        isDragging={isDragging}
        depth={depth}
      />

      {isEditing && (
        <div className={`ml-${Math.min((depth + 1) * 16, 64)}`}>
          <NavigationForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            initialData={item}
          />
        </div>
      )}

      {isAddingChild && (
        <div className={`ml-${Math.min((depth + 1) * 16, 64)}`}>
          <NavigationForm onSubmit={onSubmit} onCancel={onCancel} />
        </div>
      )}

      {item.children?.map((child) => (
        <NavigationItemWithForm
          key={child.id}
          item={child}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          isDragging={isDragging}
          editingItemId={editingItemId}
          addingChildToId={addingChildToId}
          onSubmit={onSubmit}
          onCancel={onCancel}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
