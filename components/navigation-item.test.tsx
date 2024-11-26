import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NavigationItem } from "./navigation-item";
import { DndContext } from "@dnd-kit/core";

console.log(
  "\x1b[36m%s\x1b[0m",
  `🧪 Running tests: ${new Date().toLocaleString()}`
);

describe("NavigationItem", () => {
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
    expect(itemElement).toHaveProperty("className", "space-y-2");
  });
});

console.log(
  "\x1b[36m%s\x1b[0m",
  `✨ All tests completed: ${new Date().toLocaleString()}`
);
