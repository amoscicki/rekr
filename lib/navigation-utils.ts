import { NavigationItem } from "@/types/navigation";

export function findItemAndParent(
  items: NavigationItem[],
  id: string
): [NavigationItem | null, NavigationItem | null] {
  for (const item of items) {
    if (item.id === id) {
      return [item, null];
    }
    if (item.children) {
      const [found, parent] = findItemAndParent(item.children, id);
      if (found) {
        return [found, parent || item];
      }
    }
  }
  return [null, null];
}

export function isMovingToChild(
  parent: NavigationItem,
  targetId: string
): boolean {
  if (!parent.children) return false;

  for (const child of parent.children) {
    if (child.id === targetId) return true;
    if (isMovingToChild(child, targetId)) return true;
  }
  return false;
}

export function removeFromParent(
  items: NavigationItem[],
  id: string
): NavigationItem[] {
  return items.filter((item) => {
    if (item.children) {
      item.children = removeFromParent(item.children, id);
    }
    return item.id !== id;
  });
}

export function addAsChild(
  items: NavigationItem[],
  parentId: string,
  newChild: NavigationItem
): NavigationItem[] {
  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newChild],
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addAsChild(item.children, parentId, newChild),
      };
    }
    return item;
  });
}

export function findItemIndex(
  items: NavigationItem[],
  id: string,
  parent: NavigationItem | null = null
): [number, NavigationItem[] | null] {
  // Szukamy w bieżącym poziomie
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) {
    return [index, items];
  }

  // Szukamy rekurencyjnie w dzieciach
  for (const item of items) {
    if (item.children?.length) {
      const [childIndex, childArray] = findItemIndex(item.children, id, item);
      if (childIndex !== -1) {
        return [childIndex, childArray];
      }
    }
  }

  return [-1, null];
}
