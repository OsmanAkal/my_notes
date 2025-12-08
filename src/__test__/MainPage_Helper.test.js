// src/__test__/MainPage_Helper.test.js
import { saveData, rowClick, updateNote, deletNote } from "../MainPage_Helper";

describe("MainPage_Helper fonksiyonları", () => {
  let mockSupabase;
  let mockSetNotesData;
  let mockSetRows;
  let mockSetMsgBox;
  let mockClearLeftPanel;
  let userTags;
  let notesData;

  beforeEach(() => {
    // Supabase mock
    mockSupabase = {
      from: jest.fn((table) => {
        if (table === "notes") {
          return {
            insert: jest.fn(() => ({
              select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null })
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({  error: null })
                }))
              }))
            })),
            delete: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        if (table === "note_tags") {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
            delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) }))
          };
        }
      })
    };

    mockSetNotesData = jest.fn();
    mockSetRows = jest.fn();
    mockSetMsgBox = jest.fn();
    mockClearLeftPanel = jest.fn();

    userTags = [
      { id: 1, tag_name: "tag1" },
      { id: 2, tag_name: "tag2" }
    ];

    notesData = [
      { id: 1, notes_title: "Note1", notes_content: { content: "x" }, note_tags: [] },
      { id: 2, notes_title: "Note2", notes_content: { content: "y" }, note_tags: [] }
    ];
  });

  test("saveData fonksiyonu not eklemeli ve state fonksiyonlarını çağırmalı", async () => {
    const e = { preventDefault: jest.fn() };
    await saveData(e, {
      supabase: mockSupabase,
      userId: 123,
      noteTitle: "Test Note",
      noteContent: "Test Content",
      selectedTags: [1],
      userTags,
      selectedFilterTags: [],
      setNotesData: mockSetNotesData,
      setRows: mockSetRows,
      setMsgBox: mockSetMsgBox,
      clearLeftPanel: mockClearLeftPanel
    });

    expect(e.preventDefault).toHaveBeenCalled();
    expect(mockSetNotesData).toHaveBeenCalled();
    expect(mockSetRows).toHaveBeenCalled();
  });

test("rowClick fonksiyonu seçilen notu edit için ayarlamalı", () => {
  const mockSetEditNoteId = jest.fn();
  const mockSetTitle = jest.fn();
  const mockSetContent = jest.fn();
  const mockSetSelectedTags = jest.fn();
  const mockSetSelectedRow = jest.fn();     // <-- yeni
  const mockSetSelectedRowId = jest.fn();   // <-- yeni

  rowClick(
    { id: 1, title: "Title1", content: "Content1", tags: ["tag1"] },
    {
      setEditNoteId: mockSetEditNoteId,
      setTitle: mockSetTitle,
      setContent: mockSetContent,
      setSelectedTags: mockSetSelectedTags,
      setSelectedRow: mockSetSelectedRow,       // <-- ekle
      setSelectedRowId: mockSetSelectedRowId,   // <-- ekle
      userTags
    }
  );

  expect(mockSetEditNoteId).toHaveBeenCalledWith(1);
  expect(mockSetTitle).toHaveBeenCalledWith("Title1");
  expect(mockSetContent).toHaveBeenCalledWith("Content1");
  expect(mockSetSelectedTags).toHaveBeenCalledWith([1]);
  expect(mockSetSelectedRow).toHaveBeenCalledWith(true);      // <-- kontrol
  expect(mockSetSelectedRowId).toHaveBeenCalledWith(1);      // <-- kontrol
});


  test("updateNote fonksiyonu notu güncellemeli ve state fonksiyonlarını çağırmalı", async () => {
    await updateNote({
      supabase: mockSupabase,
      editNoteId: 1,
      noteTitle: "Updated Note",
      noteContent: "Updated Content",
      selectedTags: [2],
      userTags,
      userId: 123,
      setNotesData: mockSetNotesData,
      setRows: mockSetRows,
      setMsgBox: mockSetMsgBox,
      clearLeftPanel: mockClearLeftPanel
    });

    expect(mockSetNotesData).toHaveBeenCalled();
    expect(mockSetRows).toHaveBeenCalled();
  });

  test("deletNote fonksiyonu notu silmeli ve state fonksiyonlarını çağırmalı", async () => {
    const mockSetSelectedRow = jest.fn();
    await deletNote({
      supabase: mockSupabase,
      editNoteId: 1,
      notesData,
      selectedFilterTags: [],
      userTags,
      setNotesData: mockSetNotesData,
      setRows: mockSetRows,
      setMsgBox: mockSetMsgBox,
      clearLeftPanel: mockClearLeftPanel,
      setSelectedRow: mockSetSelectedRow 
    });

    expect(mockSetNotesData).toHaveBeenCalled();
    expect(mockSetRows).toHaveBeenCalled();
    expect(mockClearLeftPanel).toHaveBeenCalled();
  });
});
