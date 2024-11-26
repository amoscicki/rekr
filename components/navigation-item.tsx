'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavigationItem as NavigationItemType } from '@/types/navigation'
import { cn } from '@/lib/utils'

interface NavigationItemProps {
  item: NavigationItemType
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAddChild: (id: string) => void
}

export function NavigationItem({ item, onEdit, onDelete, onAddChild }: NavigationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('space-y-2', isDragging && 'opacity-50')}
    >
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <button {...listeners} {...attributes} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
          />
        </Button>
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
            onClick={() => onEdit(item.id)}
          >
            Edytuj
          </Button>
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
            onClick={() => onAddChild(item.id)}
          >
            Dodaj pozycję menu
          </Button>
        </div>
      </div>
      {isExpanded && item.children && item.children.length > 0 && (
        <div className="ml-8 space-y-2">
          {item.children.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

