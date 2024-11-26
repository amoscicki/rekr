'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { NavigationForm } from './components/navigation-form'
import { NavigationItem } from './components/navigation-item'
import { useNavigation } from './hooks/useNavigation'
import { NavigationFormData } from './types/navigation'

export default function NavigationManager() {
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [addingChildToId, setAddingChildToId] = useState<string | null>(null)
  const { items, addItem, updateItem, removeItem, reorderItems } = useNavigation()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = [...items]
      const [removed] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, removed)

      reorderItems(newItems)
    }
  }

  const handleSubmit = (data: NavigationFormData) => {
    if (editingItemId) {
      updateItem(editingItemId, data)
      setEditingItemId(null)
    } else if (addingChildToId) {
      addItem(
        {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
        },
        addingChildToId
      )
      setAddingChildToId(null)
    } else {
      addItem({
        id: Math.random().toString(36).substr(2, 9),
        ...data,
      })
      setIsAddingItem(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Menu jest puste</h1>
        <p className="text-muted-foreground">
          W tym menu nie ma jeszcze żadnych linków.
        </p>
      </div>

      {(isAddingItem || editingItemId || addingChildToId) && (
        <NavigationForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsAddingItem(false)
            setEditingItemId(null)
            setAddingChildToId(null)
          }}
          initialData={
            editingItemId
              ? items.find((item) => item.id === editingItemId)
              : undefined
          }
        />
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                onEdit={setEditingItemId}
                onDelete={removeItem}
                onAddChild={setAddingChildToId}
              />
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
          Dodaj pozycję menu
        </Button>
      )}
    </div>
  )
}

