"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  DragOverlay,
  useDroppable,
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
      className="h-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
      data-drop-zone="root"
      style={{
        background: isOver ? "rgba(127, 86, 217, 0.1)" : "transparent",
        border: isOver ? "2px dashed var(--primary)" : "none",
      }}
    />
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
      className="h-8 border-2 border-dashed border-primary/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity mt-2"
      data-drop-zone="root-end"
      style={{
        background: isOver ? "rgba(127, 86, 217, 0.1)" : "transparent",
      }}
    />
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

export default function NavigationManager() {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingChildToId, setAddingChildToId] = useState<string | null>(null);
  const { items, addItem, updateItem, removeItem, reorderItems } =
    useNavigation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [draggedItem, draggedParent] = findItemAndParent(
      items,
      active.id as string
    );
    if (!draggedItem) return;

    let newItems = [...items];

    // Jeśli upuszczamy na root drop zone lub końcową drop zone
    if (over.id === "root-drop-zone" || over.id === "root-end") {
      // Usuń element z poprzedniej lokalizacji tylko jeśli nie jest już na root level
      if (draggedParent) {
        newItems = removeFromParent(newItems, draggedItem.id);
        // Dodaj na koniec głównej listy
        newItems.push(draggedItem);
      }
      reorderItems(newItems);
      return;
    }

    // Jeśli przeciągamy na element
    const [targetItem, targetParent] = findItemAndParent(
      items,
      over.id as string
    );
    if (!targetItem) return;

    // Nie pozwalamy na przeniesienie rodzica do jego dziecka
    if (isMovingToChild(draggedItem, over.id as string)) {
      return;
    }

    // Nie usuwamy elementu, jeśli jest już w docelowym miejscu
    const isSamePosition =
      (draggedParent === targetParent && draggedItem.id === targetItem.id) ||
      (draggedParent === null && targetParent === null);

    if (!isSamePosition) {
      // Usuń element z poprzedniej lokalizacji
      newItems = removeFromParent(newItems, draggedItem.id);

      // Sprawdź pozycję kursora względem elementu docelowego
      const targetRect = (over.data.current as any)?.rect;
      const cursorY = (event as any).activatorEvent?.clientY;

      if (!targetRect || typeof cursorY !== "number") {
        // Fallback: dodaj jako dziecko
        newItems = addAsChild(newItems, targetItem.id, draggedItem);
      } else {
        const threshold = targetRect.top + targetRect.height * 0.5;

        if (cursorY < threshold) {
          // Dodaj przed elementem
          if (targetParent) {
            const parentChildren = targetParent.children || [];
            const targetIndex = parentChildren.findIndex(
              (child) => child.id === targetItem.id
            );
            newItems = addToParentAtIndex(
              newItems,
              targetParent.id,
              draggedItem,
              targetIndex
            );
          } else {
            const targetIndex = newItems.findIndex(
              (item) => item.id === targetItem.id
            );
            newItems.splice(targetIndex, 0, draggedItem);
          }
        } else {
          // Dodaj jako dziecko
          newItems = addAsChild(newItems, targetItem.id, draggedItem);
        }
      }
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
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <RootDropZone />
                {items.map((item, index) => (
                  <div key={item.id}>
                    <NavigationItem
                      item={item}
                      onEdit={setEditingItemId}
                      onDelete={removeItem}
                      onAddChild={setAddingChildToId}
                    />
                  </div>
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

      {(isAddingItem || editingItemId || addingChildToId) && (
        <NavigationForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsAddingItem(false);
            setEditingItemId(null);
            setAddingChildToId(null);
          }}
          initialData={
            editingItemId
              ? items.find((item) => item.id === editingItemId)
              : undefined
          }
        />
      )}
    </div>
  );
}
