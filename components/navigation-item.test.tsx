import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { NavigationItem } from "./navigation-item";

describe("NavigationItem", () => {
  const mockItem = {
    id: "1",
    label: "Test Item",
    url: "https://example.com",
  };

  it("renders item with correct label and url", () => {
    const { getByText } = render(
      <NavigationItem
        item={mockItem}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddChild={() => {}}
      />
    );

    expect(getByText("Test Item")).toBeDefined();
    expect(getByText("https://example.com")).toBeDefined();
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    const { getByText } = render(
      <NavigationItem
        item={mockItem}
        onEdit={() => {}}
        onDelete={onDelete}
        onAddChild={() => {}}
      />
    );

    fireEvent.click(getByText("Usuń"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
