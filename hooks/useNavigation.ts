'use client'

import { useState } from 'react'
import { NavigationItem } from '@/types/navigation'

export function useNavigation() {
  const [items, setItems] = useState<NavigationItem[]>([])

  const addItem = (item: NavigationItem, parentId?: string) => {
    if (!parentId) {
      setItems([...items, item])
      return
    }

    const updateItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map((current) => {
        if (current.id === parentId) {
          return {
            ...current,
            children: [...(current.children || []), item],
          }
        }
        if (current.children) {
          return {
            ...current,
            children: updateItems(current.children),
          }
        }
        return current
      })
    }

    setItems(updateItems(items))
  }

  const updateItem = (itemId: string, updates: Partial<NavigationItem>) => {
    const updateItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...updates }
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          }
        }
        return item
      })
    }

    setItems(updateItems(items))
  }

  const removeItem = (itemId: string) => {
    const removeFromItems = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: removeFromItems(item.children),
            }
          }
          return item
        })
    }

    setItems(removeFromItems(items))
  }

  const reorderItems = (items: NavigationItem[]) => {
    setItems(items)
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
  }
}

