"use client";

import { useState } from "react";
import { NavigationItem, EXAMPLE_MENU } from "@/types/navigation";

export function useNavigation() {
  const [items, setItems] = useState<NavigationItem[]>(EXAMPLE_MENU);

  const addItem = (newItem: NavigationItem, parentId?: string) => {
    if (!parentId) {
      setItems([...items, newItem]);
      return;
    }

    const updateChildren = (items: NavigationItem[]): NavigationItem[] => {
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
            children: updateChildren(item.children),
          };
        }
        return item;
      });
    };

    setItems(updateChildren(items));
  };

  const updateItem = (id: string, data: Partial<NavigationItem>) => {
    const updateItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...data };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };

    setItems(updateItems(items));
  };

  const removeItem = (id: string) => {
    const removeFromItems = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: removeFromItems(item.children),
            };
          }
          return item;
        });
    };

    setItems(removeFromItems(items));
  };

  const reorderItems = (newItems: NavigationItem[]) => {
    setItems(newItems);
  };

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
  };
}
