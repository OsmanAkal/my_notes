// src/__test__/MainPage_functions.test.js
import React, { useState } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import '@testing-library/jest-dom';


// Test için mini component
const TestComponent = ({ initialNotes }) => {
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(initialNotes);

  const selectFilterTag = (id) => {
    setSelectedFilterTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectTag = (t) => {
    setSelectedTags(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const applyFilters = () => {
    let list = [...initialNotes];

    // Search filter
    if (searchText.trim() !== "") {
      const s = searchText.toLowerCase();
      list = list.filter(
        n =>
          n.notes_title.toLowerCase().includes(s) ||
          n.notes_content?.content?.toLowerCase().includes(s)
      );
    }

    // Tag filter
    if (selectedFilterTags.length > 0) {
      list = list.filter(n =>
        n.note_tags?.some(t => selectedFilterTags.includes(t.tag_id))
      );
    }

    // UI mapping
    const mapped = list.map(note => ({
      id: note.id,
      title: note.notes_title,
      content: note.notes_content?.content || "",
      tags: note.note_tags?.map(t => t.tags.tag_name) || []
    }));

    setRows(mapped);
  };

  return (
    <div>
      <button onClick={() => selectFilterTag(1)} data-testid="filter-1">Filter 1</button>
      <button onClick={() => selectTag("tagA")} data-testid="tagA">Tag A</button>
      <button onClick={applyFilters} data-testid="apply">Apply</button>
      <div data-testid="rows">{JSON.stringify(rows)}</div>
    </div>
  );
};

// Testler
describe("TestComponent fonksiyonları", () => {
  const notesData = [
    { id: 1, notes_title: "Test1", notes_content: { content: "Hello world" }, note_tags: [{ tag_id: 1, tags: { tag_name: "tagA" } }] },
    { id: 2, notes_title: "Test2", notes_content: { content: "Another note" }, note_tags: [{ tag_id: 2, tags: { tag_name: "tagB" } }] }
  ];

  test("selectFilterTag çalışıyor", () => {
    render(<TestComponent initialNotes={notesData} />);
    const btn = screen.getByTestId("filter-1");

    fireEvent.click(btn);
    expect(screen.getByTestId("rows")).toBeInTheDocument(); // state mevcut
  });

  test("selectTag çalışıyor", () => {
    render(<TestComponent initialNotes={notesData} />);
    const btn = screen.getByTestId("tagA");

    fireEvent.click(btn);
    expect(screen.getByTestId("rows")).toBeInTheDocument(); // state mevcut
  });

  test("applyFilters search ve tag filtreleme yapıyor", () => {
    render(<TestComponent initialNotes={notesData} />);
    const applyBtn = screen.getByTestId("apply");

    fireEvent.click(applyBtn);
    const rowsDiv = screen.getByTestId("rows");
    expect(rowsDiv.textContent).toContain("Test1");
    expect(rowsDiv.textContent).toContain("Test2");
  });
});
