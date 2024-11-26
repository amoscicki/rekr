"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { NavigationForm } from "@/components/navigation-form";
import { NavigationItem } from "@/components/navigation-item";
import { useNavigation } from "@/hooks/useNavigation";
import {
  NavigationFormData,
  NavigationItem as NavigationItemType,
} from "@/types/navigation";
import { Plus } from "lucide-react";

type PathSegment = number;
type Path = PathSegment[];

export default function NavigationManager() {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingChildToId, setAddingChildToId] = useState<string | null>(null);
  const { items, addItem, updateItem, removeItem, reorderItems } =
    useNavigation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const findPath = (
      items: NavigationItemType[],
      id: string,
      path: Path = []
    ): Path | null => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) return [...path, i];
        if (items[i].children) {
          const childPath = findPath(items[i].children!, id, [...path, i]);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const activePath = findPath(items, activeId);
    const overPath = findPath(items, overId);

    if (!activePath || !overPath) return;

    const newItems = JSON.parse(JSON.stringify(items));

    const getItemByPath = (
      items: NavigationItemType[],
      path: number[]
    ): NavigationItemType => {
      let current = items;
      let item = null;

      for (let i = 0; i < path.length; i++) {
        if (typeof path[i] === "string") {
          current = current[path[i - 1]].children!;
        } else {
          item = current[path[i]];
        }
      }
      return item!;
    };

    const removeItemByPath = (
      items: NavigationItemType[],
      path: number[]
    ): NavigationItemType => {
      let current = items;
      let removed = null;

      for (let i = 0; i < path.length - 1; i++) {
        if (typeof path[i] === "string") {
          current = current[path[i - 1]].children!;
        } else {
          current = current[path[i]].children || current;
        }
      }

      const lastIndex = path[path.length - 1];
      [removed] = current.splice(lastIndex, 1);
      return removed;
    };

    const insertItemByPath = (
      items: NavigationItemType[],
      path: number[],
      item: NavigationItemType
    ) => {
      let current = items;

      for (let i = 0; i < path.length - 1; i++) {
        if (typeof path[i] === "string") {
          current = current[path[i - 1]].children!;
        } else {
          current = current[path[i]].children || current;
        }
      }

      const lastIndex = path[path.length - 1];
      current.splice(lastIndex, 0, item);
    };

    const activeItem = getItemByPath(newItems, activePath);
    removeItemByPath(newItems, activePath);
    insertItemByPath(newItems, overPath, activeItem);

    reorderItems(newItems);
  };

  const handleSubmit = (data: NavigationFormData) => {
    if (editingItemId) {
      updateItem(editingItemId, data);
      setEditingItemId(null);
    } else if (addingChildToId) {
      addItem(
        {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
        },
        addingChildToId
      );
      setAddingChildToId(null);
    } else {
      addItem({
        id: Math.random().toString(36).substr(2, 9),
        ...data,
      });
      setIsAddingItem(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Menu jest puste</h1>
          <p className="text-muted-foreground">
            W tym menu nie ma jeszcze żadnych linków.
          </p>
        </div>
        <Button
          onClick={() => setIsAddingItem(true)}
          className="w-full"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          Dodaj pozycję menu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <NavigationItem
                  item={item}
                  onEdit={setEditingItemId}
                  onDelete={removeItem}
                  onAddChild={setAddingChildToId}
                />

                {addingChildToId === item.id && (
                  <div className="ml-16">
                    <NavigationForm
                      onSubmit={handleSubmit}
                      onCancel={() => setAddingChildToId(null)}
                    />
                  </div>
                )}

                {item.children?.map((child) => (
                  <div key={child.id} className="ml-16">
                    <NavigationItem
                      item={child}
                      onEdit={setEditingItemId}
                      onDelete={removeItem}
                      onAddChild={setAddingChildToId}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!isAddingItem && !editingItemId && !addingChildToId && (
        <Button
          onClick={() => setIsAddingItem(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Dodaj pozycję menu
        </Button>
      )}
    </div>
  );
}
