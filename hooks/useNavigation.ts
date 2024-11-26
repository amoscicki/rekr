"use client";

import { useState, useEffect } from "react";
import { NavigationItem, EXAMPLE_MENU } from "@/types/navigation";

const STORAGE_KEY = "navigation_items";

// Funkcja do rekurencyjnego generowania nowych ID
const regenerateIds = (items: NavigationItem[]): NavigationItem[] => {
  return items.map((item) => {
    const newId = `nav_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    return {
      ...item,
      id: newId,
      children: item.children ? regenerateIds(item.children) : undefined,
    };
  });
};

export function useNavigation() {
  const [items, setItems] = useState<NavigationItem[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedItems = JSON.parse(saved);
        // Regeneruj ID przy wczytywaniu z localStorage
        return regenerateIds(parsedItems);
      }
      // Jeśli nie ma zapisanych danych, użyj EXAMPLE_MENU z nowymi ID
      return regenerateIds(EXAMPLE_MENU);
    } catch {
      return regenerateIds(EXAMPLE_MENU);
    }
  });

  // Zapisz do localStorage przy każdej zmianie
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: NavigationItem, parentId?: string) => {
    if (!parentId) {
      setItems((prev) => [...prev, item]);
      return;
    }

    setItems((prev) => {
      const updateChildren = (items: NavigationItem[]): NavigationItem[] => {
        return items.map((currentItem) => {
          if (currentItem.id === parentId) {
            return {
              ...currentItem,
              children: [...(currentItem.children || []), item],
            };
          }
          if (currentItem.children) {
            return {
              ...currentItem,
              children: updateChildren(currentItem.children),
            };
          }
          return currentItem;
        });
      };
      return updateChildren(prev);
    });
  };

  const updateItem = (itemId: string, updates: Partial<NavigationItem>) => {
    const updateItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...updates };
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

  const removeItem = (itemId: string) => {
    const removeFromItems = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => item.id !== itemId)
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

  const reorderItems = (items: NavigationItem[]) => {
    setItems(items);
  };

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
  };
}
