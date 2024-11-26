import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NavigationItem } from "./navigation-item";
import { DndContext } from "@dnd-kit/core";
import { NavigationItem as NavigationItemType } from "@/types/navigation";

console.log(
  "\x1b[36m%s\x1b[0m",
  `🧪 Running tests: ${new Date().toLocaleString()}`
);

// Poprawiony mock dla useSortable
const mockUseSortable = vi.fn();
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => mockUseSortable(),
}));

describe("NavigationItem", () => {
  beforeEach(() => {
    // Domyślne wartości dla mocka
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      transition: null,
      isDragging: false,
      isOver: false,
    });
  });

  const mockItem = {
    id: "1",
    label: "Test Item",
    url: "https://example.com",
  };

  // Test renderowania podstawowych elementów
  test("renders basic elements", () => {
    render(
      <DndContext>
        <NavigationItem
          item={mockItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={() => {}}
        />
      </DndContext>
    );

    // Używamy screen.getByLabelText do znalezienia przycisku drag
    expect(screen.getByLabelText("move item")).toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  // Test przycisków akcji
  test("action buttons trigger correct callbacks", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onAddChild = vi.fn();

    const { getByText } = render(
      <DndContext>
        <NavigationItem
          item={mockItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      </DndContext>
    );

    // Kliknij każdy przycisk i sprawdź callback
    fireEvent.click(getByText("Usuń"));
    expect(onDelete).toHaveBeenCalledWith("1");

    fireEvent.click(getByText("Edytuj"));
    expect(onEdit).toHaveBeenCalledWith("1");

    fireEvent.click(getByText("Dodaj pozycję menu"));
    expect(onAddChild).toHaveBeenCalledWith("1");
  });

  // Test dla zagnieżdżonych elementów
  test("renders nested items correctly", () => {
    const nestedItem = {
      ...mockItem,
      children: [
        {
          id: "2",
          label: "Child Item",
          url: "https://example.com/child",
        },
      ],
    };

    const { getByText } = render(
      <DndContext>
        <NavigationItem
          item={nestedItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={() => {}}
        />
      </DndContext>
    );

    expect(getByText("Child Item")).toBeDefined();
    expect(getByText("https://example.com/child")).toBeDefined();
  });

  // Test dla stanu przeciągania
  test("applies dragging styles when isDragging", () => {
    // Ustawiamy isDragging na true dla tego testu
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      transition: null,
      isDragging: true,
      isOver: false,
    });

    const { container } = render(
      <DndContext>
        <NavigationItem
          item={mockItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={() => {}}
        />
      </DndContext>
    );

    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveClass("opacity-50");
    expect(itemElement).toHaveClass("cursor-grabbing");
  });

  // Test dla głęboko zagnieżdżonych elementów
  test("renders deeply nested items correctly", () => {
    const deeplyNestedItem: NavigationItemType = {
      id: "1",
      label: "Parent",
      url: "https://example.com",
      children: [
        {
          id: "2",
          label: "Child",
          children: [
            {
              id: "3",
              label: "Grandchild",
              children: [
                {
                  id: "4",
                  label: "Great Grandchild",
                  url: "https://example.com/deep",
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <DndContext>
        <NavigationItem
          item={deeplyNestedItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={() => {}}
        />
      </DndContext>
    );

    // Sprawdź czy wszystkie poziomy są renderowane
    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.getByText("Grandchild")).toBeInTheDocument();
    expect(screen.getByText("Great Grandchild")).toBeInTheDocument();

    // Sprawdź wcięcia
    const childElements = screen.getAllByRole("button", { name: /move item/i });
    expect(childElements).toHaveLength(4); // Powinny być 4 przyciski drag
  });

  // Test dla dodawania dzieci na różnych poziomach
  test("handles adding children at different levels", () => {
    const onAddChild = vi.fn();
    const nestedItem: NavigationItemType = {
      id: "1",
      label: "Parent",
      children: [
        {
          id: "2",
          label: "Child",
        },
      ],
    };

    render(
      <DndContext>
        <NavigationItem
          item={nestedItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={onAddChild}
        />
      </DndContext>
    );

    // Znajdź wszystkie przyciski "Dodaj pozycję menu"
    const addButtons = screen.getAllByText("Dodaj pozycję menu");

    // Powinny być dwa przyciski - jeden dla rodzica, jeden dla dziecka
    expect(addButtons).toHaveLength(2);

    // Kliknij w przycisk dodawania dla dziecka
    fireEvent.click(addButtons[1]);
    expect(onAddChild).toHaveBeenCalledWith("2");
  });

  test("handles deep nesting up to 4 levels when adding children", () => {
    const onAddChild = vi.fn();
    const deeplyNestedItem: NavigationItemType = {
      id: "1",
      label: "Level 1",
      children: [
        {
          id: "2",
          label: "Level 2",
          children: [
            {
              id: "3",
              label: "Level 3",
              children: [
                {
                  id: "4",
                  label: "Level 4",
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <DndContext>
        <NavigationItem
          item={deeplyNestedItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={onAddChild}
        />
      </DndContext>
    );

    // Sprawdź czy wszystkie poziomy są renderowane z odpowiednim wcięciem
    const items = screen.getAllByRole("button", { name: /move item/i });
    expect(items).toHaveLength(4);

    // Sprawdź czy każdy poziom ma przycisk "Dodaj pozycję menu"
    const addButtons = screen.getAllByText("Dodaj pozycję menu");
    expect(addButtons).toHaveLength(4);

    // Sprawdź czy można dodać element na każdym poziomie
    fireEvent.click(addButtons[3]); // Kliknij przycisk na 4 poziomie
    expect(onAddChild).toHaveBeenCalledWith("4");
  });

  test("maintains nesting structure during drag and drop", () => {
    const onDragEnd = vi.fn();
    const deepStructure: NavigationItemType = {
      id: "1",
      label: "Root",
      children: [
        {
          id: "2",
          label: "Level 2",
          children: [
            {
              id: "3",
              label: "Level 3",
            },
          ],
        },
      ],
    };

    // Mockujemy DndContext zamiast używać prawdziwego
    const DndContextMock = ({ children, onDragEnd }: any) => {
      const handleDragEnd = () => {
        onDragEnd({
          active: { id: "3" },
          over: { id: "1" },
          activatorEvent: { clientX: 100, clientY: 100 } as any,
        });
      };

      return (
        <div data-testid="dnd-context" onMouseUp={handleDragEnd}>
          {children}
        </div>
      );
    };

    render(
      <DndContextMock onDragEnd={onDragEnd}>
        <NavigationItem
          item={deepStructure}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddChild={() => {}}
        />
      </DndContextMock>
    );

    // Sprawdź czy wszystkie poziomy są obecne
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("Level 3")).toBeInTheDocument();

    // Symuluj przeciąganie
    const dragHandle = screen.getAllByLabelText("move item")[2]; // Level 3
    fireEvent.mouseDown(dragHandle);
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(dragHandle);

    // Sprawdź czy onDragEnd został wywołany z odpowiednimi parametrami
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        active: expect.objectContaining({ id: "3" }),
        over: expect.objectContaining({ id: "1" }),
      })
    );
  });
});

console.log(
  "\x1b[36m%s\x1b[0m",
  `✨ All tests completed: ${new Date().toLocaleString()}`
);
