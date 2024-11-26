"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  DragOverlay,
  useDroppable,
  useSensor,
  PointerSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { NavigationForm } from "@/components/navigation-form";
import { NavigationItem } from "@/components/navigation-item";
import { useNavigation } from "@/hooks/useNavigation";
import {
  NavigationFormData,
  NavigationItem as NavigationItemType,
} from "@/types/navigation";
import { cn } from "@/lib/utils";

const findItemAndParent = (
  items: NavigationItemType[],
  id: string,
  parent: NavigationItemType | null = null
): [NavigationItemType | null, NavigationItemType | null] => {
  for (const item of items) {
    if (item.id === id) {
      return [item, parent];
    }
    if (item.children) {
      const [found, foundParent] = findItemAndParent(item.children, id, item);
      if (found) {
        return [found, foundParent];
      }
    }
  }
  return [null, null];
};

function RootDropZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "root-drop-zone",
    data: {
      type: "root",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-12 rounded-lg transition-all border-2 border-dashed",
        isOver ? "opacity-100" : "opacity-0 hover:opacity-50"
      )}
      style={{
        background: isOver ? "rgba(127, 86, 217, 0.1)" : "transparent",
        borderColor: "rgb(127, 86, 217)",
      }}
    >
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Upuść tutaj aby dodać na początku listy
      </div>
    </div>
  );
}

function EndDropZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "root-end",
    data: {
      type: "root-end",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-12 rounded-lg transition-all mt-2 border-2 border-dashed",
        isOver ? "opacity-100" : "opacity-0 hover:opacity-50"
      )}
      style={{
        background: isOver ? "rgba(127, 86, 217, 0.1)" : "transparent",
        borderColor: "rgb(127, 86, 217)",
      }}
    >
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Upuść tutaj aby dodać na końcu listy
      </div>
    </div>
  );
}

// Funkcje pomocnicze
const isMovingToChild = (
  parent: NavigationItemType,
  targetId: string
): boolean => {
  if (!parent.children) return false;
  return parent.children.some(
    (child) =>
      child.id === targetId ||
      (child.children && isMovingToChild(child, targetId))
  );
};

const removeFromParent = (
  items: NavigationItemType[],
  id: string
): NavigationItemType[] => {
  return items.filter((item) => {
    if (item.children) {
      item.children = removeFromParent(item.children, id);
    }
    return item.id !== id;
  });
};

const addAsChild = (
  items: NavigationItemType[],
  parentId: string,
  newItem: NavigationItemType
): NavigationItemType[] => {
  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addAsChild(item.children, parentId, newItem),
      };
    }
    return item;
  });
};

const addBefore = (
  items: NavigationItemType[],
  targetId: string,
  newItem: NavigationItemType
): NavigationItemType[] => {
  const result: NavigationItemType[] = [];
  for (const item of items) {
    if (item.id === targetId) {
      result.push(newItem);
    }
    result.push({
      ...item,
      children: item.children
        ? addBefore(item.children, targetId, newItem)
        : undefined,
    });
  }
  return result;
};

const addToParentAtIndex = (
  items: NavigationItemType[],
  parentId: string,
  newItem: NavigationItemType,
  index: number
): NavigationItemType[] => {
  return items.map((item) => {
    if (item.id === parentId) {
      const newChildren = [...(item.children || [])];
      newChildren.splice(index, 0, newItem);
      return { ...item, children: newChildren };
    }
    if (item.children) {
      return {
        ...item,
        children: addToParentAtIndex(item.children, parentId, newItem, index),
      };
    }
    return item;
  });
};

const findItemIndex = (items: NavigationItemType[], id: string): number => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return i;
    if (items[i].children?.length) {
      const index = findItemIndex(items[i].children, id);
      if (index !== -1) return index;
    }
  }
  return -1;
};

export default function NavigationManager() {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingChildToId, setAddingChildToId] = useState<string | null>(null);
  const { items, addItem, updateItem, removeItem, reorderItems } =
    useNavigation();
  const [mounted, setMounted] = useState(false);
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimalna odległość przed rozpoczęciem przeciągania
      },
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDragStart = () => {
    setIsDraggingAny(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingAny(false);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current as {
      type: string;
      parentId?: string;
      targetId?: string;
    };

    const [draggedItem, draggedParent] = findItemAndParent(items, activeId);
    if (!draggedItem) return;

    let newItems = [...items];

    switch (overData.type) {
      case "nest":
        if (isMovingToChild(draggedItem, overData.parentId!)) return;
        newItems = removeFromParent(newItems, draggedItem.id);
        newItems = addAsChild(newItems, overData.parentId!, draggedItem);
        break;

      case "before":
      case "after": {
        const [targetIndex, targetArray] = findItemIndex(
          newItems,
          overData.targetId!
        );
        if (targetArray) {
          const [currentIndex, currentArray] = findItemIndex(
            newItems,
            draggedItem.id
          );
          if (currentArray === targetArray) {
            // Przesuwamy w ramach tego samego poziomu
            const newIndex =
              overData.type === "after" ? targetIndex + 1 : targetIndex;
            const oldIndex = currentIndex;
            targetArray.splice(newIndex, 0, ...targetArray.splice(oldIndex, 1));
          } else {
            // Przenosimy między poziomami
            newItems = removeFromParent(newItems, draggedItem.id);
            const [newTargetIndex, newTargetArray] = findItemIndex(
              newItems,
              overData.targetId!
            );
            if (newTargetArray) {
              newTargetArray.splice(
                overData.type === "after" ? newTargetIndex + 1 : newTargetIndex,
                0,
                draggedItem
              );
            }
          }
        }
        break;
      }

      case "root":
      case "root-end":
        newItems = removeFromParent(newItems, draggedItem.id);
        if (overData.type === "root-end") {
          newItems.push(draggedItem);
        } else {
          newItems.unshift(draggedItem);
        }
        break;
    }

    reorderItems(newItems);
  };

  const handleSubmit = (data: NavigationFormData) => {
    if (editingItemId) {
      updateItem(editingItemId, data);
      setEditingItemId(null);
    } else if (addingChildToId) {
      // Dodajemy jako dziecko do konkretnego elementu
      const parentItem = items.find((item) => item.id === addingChildToId);
      if (parentItem) {
        addItem(
          {
            ...data,
            id: `nav_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
          addingChildToId
        );
      }
      setAddingChildToId(null);
    } else {
      // Dodajemy jako główny element
      addItem({
        ...data,
        id: `nav_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      });
      setIsAddingItem(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {items.length === 0 ? (
        // Stan pusty
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Menu jest puste</h1>
          <p className="text-muted-foreground">
            W tym menu nie ma jeszcze żadnych linków.
          </p>
          <Button
            onClick={() => setIsAddingItem(true)}
            className="w-full"
            variant="default"
          >
            Dodaj pozycję menu
          </Button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <RootDropZone />
                {items.map((item) => (
                  <NavigationItem
                    key={item.id}
                    item={item}
                    onEdit={setEditingItemId}
                    onDelete={removeItem}
                    onAddChild={setAddingChildToId}
                    isDragging={isDraggingAny}
                    depth={0}
                    isEditing={editingItemId === item.id}
                    onSubmit={handleSubmit}
                    onCancelEdit={() => setEditingItemId(null)}
                  />
                ))}
                <EndDropZone />
              </div>
            </SortableContext>
          </DndContext>

          {!isAddingItem && !editingItemId && !addingChildToId && (
            <Button
              onClick={() => setIsAddingItem(true)}
              className="w-full"
              variant="outline"
            >
              Dodaj pozycję menu
            </Button>
          )}
        </>
      )}

      {isAddingItem && (
        <NavigationForm
          onSubmit={handleSubmit}
          onCancel={() => setIsAddingItem(false)}
        />
      )}
    </div>
  );
}
