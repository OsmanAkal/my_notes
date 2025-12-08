 import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import MainPage_NotesTable from "../MainPageNotesTable";
import React from "react";

// ---- TAM UYUMLU SUPABASE MOCK ----
const mockInsert = jest.fn(() => ({
  select: jest.fn(() => ({
    data: [{ id: 1, tag_name: "MockTag" }],
    error: null,
  })),
}));

const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() => ({ error: null })),
}));

const mockDelete = jest.fn(() => ({
  eq: jest.fn(() => ({ error: null })),
}));

const mockSupabase = {
  from: jest.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  })),
};




describe("MainPage_NotesTable Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------
  // 1) YENİ TAG EKLEME TESTİ
  // ------------------------------------------------------


test("Yeni tag ekleme çalışıyor", async () => {
  const setUserTags = jest.fn();
  
  // Ref oluştur
  const ref = React.createRef();

  // Supabase mock
  const mockInsert = jest.fn(() => ({
    select: jest.fn(() => ({
      data: [{ id: 1, tag_name: "MockTag" }],
      error: null,
    })),
  }));
  
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: mockInsert,
      update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
      delete: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
    })),
  };


  render(
    <MainPage_NotesTable
      userId={1}
      userTags={[]}
      setUserTags={setUserTags}
      supabase={mockSupabase}
      ref={ref} // <-- Ref burada verildi
    />
  );

  // Ref’in oluşmasını bekle
  await waitFor(() => {
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current.openTagModal).toBe("function");
  });

  // Modal aç
  act(() => {
    ref.current.openTagModal();
  });

  // Input’a değer gir
  const input = screen.getByPlaceholderText("Tag yazın");
  fireEvent.change(input, { target: { value: "TestTag" } });

  // Kaydet butonuna bas
  const button = screen.getByText("Kaydet");
  fireEvent.click(button);

  // Supabase çağrıldı mı ve state update oldu mu kontrol
  await waitFor(() => {
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
    expect(setUserTags).toHaveBeenCalled();
  });
});


  // ------------------------------------------------------
  // 2) TAG DÜZENLEME
  // ------------------------------------------------------
 test("Tag düzenleme çalışıyor", async () => {
  const setUserTags = jest.fn();

  // Ref oluştur
  const ref = React.createRef();

  // Mock Supabase
  const mockSupabase = {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ data: [{ id: 1, tag_name: "Mock" }], error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
  };

  render(
    <MainPage_NotesTable
      userId={1}
      userTags={[{ id: 1, tag_name: "OldTag" }]}
      setUserTags={setUserTags}
      supabase={mockSupabase}
      ref={ref} // <--- ref burada verilmeli
    />
  );

  // Ref oluşmasını bekle
  await waitFor(() => {
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current.openTagModal).toBe("function");
  });

  // Modal aç
  act(() => {
    ref.current.openTagModal();
  });

  // Input’u bul
  const input = screen.getByPlaceholderText("Tag yazın");
  fireEvent.change(input, { target: { value: "NewTag" } });

  // Kaydet butonuna bas
  const button = screen.getByText("Kaydet");
  fireEvent.click(button);

  // Supabase çağrıldı ve setUserTags çağrıldı mı kontrol
  await waitFor(() => {
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
    expect(setUserTags).toHaveBeenCalled();
  });
});


  // ------------------------------------------------------
  // 3) TAG SİLME
  // ------------------------------------------------------
test("Tag silme çalışıyor", async () => {
  // Önce userTags ve ref
  const userTags = [{ id: 7, tag_name: "SilinecekTag", user_id: 1 }];
  const ref = React.createRef();

  // Supabase delete mock
  const mockDelete = jest.fn(() => ({
    eq: jest.fn(() => ({ error: null })),
  }));

  const mockSupabase = {
    from: jest.fn(() => ({
      delete: mockDelete,
    })),
  };

  // setUserTags fonksiyonu ve callback kontrolü
  let newTags;
  const setUserTags = jest.fn(fn => {
    newTags = fn(userTags); // callback çalıştırılır
  });

  render(
    <MainPage_NotesTable
      userId={1}
      userTags={userTags}
      setUserTags={setUserTags}
      supabase={mockSupabase}
      ref={ref}
    />
  );

  // Modal aç
  act(() => {
    ref.current.openTagModal();
  });

  // Tag DOM'a gelene kadar bekle
  await waitFor(() => screen.getByText("SilinecekTag"));

  // Sil butonuna tıkla
  fireEvent.click(screen.getByText("Sil"));

  // Confirm modal açılmasını bekle
  const yesButton = await screen.findByText("Evet");
  fireEvent.click(yesButton);

  // Supabase ve state callback kontrolü
  await waitFor(() => {
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
    expect(mockDelete).toHaveBeenCalled();
    expect(setUserTags).toHaveBeenCalled();
    expect(newTags).toEqual([]); // silindikten sonra state boş olmalı
  });
});

});
