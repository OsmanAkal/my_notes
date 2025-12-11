// MainPage_Helper.js
export const handleSearchChange = async ({
  e,
  notesData,
  supabase,
  setRows,
  setSearchText,
  searchToken
}) => {
  const value = e.target.value;
  setSearchText(value);

  const currentToken = ++searchToken.current;

  if (value.trim() === "") {
    const mapped = notesData.map(note => ({
      id: note.id,
      title: note.notes_title,
      content: note.notes_content?.content || "",
      tags: note.note_tags?.map(t => t.tags.tag_name) || []
    }));

    if (currentToken === searchToken.current) {
      setRows(mapped);
    }
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .select("id")
    .textSearch("search_vector", `${value}:*`, { config: "simple" });

  if (currentToken !== searchToken.current) return;

  if (error) {
    console.log(error);
    return;
  }

  const matchedIds = data.map(n => n.id);

  const filtered = notesData
    .filter(n => matchedIds.includes(n.id))
    .map(note => ({
      id: note.id,
      title: note.notes_title,
      content: note.notes_content?.content || "",
      tags: note.note_tags?.map(t => t.tags.tag_name) || []
    }));

  setRows(filtered);
};



// saveData
export const saveData = async (e, {
  supabase,
  userId,
  noteTitle,
  noteContent,
  selectedTags,
  userTags,
  selectedFilterTags,
  setNotesData,
  setRows,
  setMsgBox,
  clearLeftPanel
}) => {
  e.preventDefault();

  const jsonData = { content: noteContent };

  const { data: noteData, error: noteError } = await supabase
    .from("notes")
    .insert([{ user_id: userId, notes_title: noteTitle, notes_content: jsonData }])
    .select();

  if (noteError) {
    setMsgBox({
      show: true,
      title: "Uyarı",
      message: "Not oluşturulurken hata: " + noteError.message,
      confirmText: null,
      cancelText: "Kapat",
      onCancel: () => setMsgBox(prev => ({ ...prev, show: false })),
    });
    return;
  }

  const noteId = noteData[0].id;

  if (selectedTags.length > 0) {
    const tagInserts = selectedTags.map(tagId => ({
      note_id: noteId,
      tag_id: tagId,
      user_id: userId
    }));

    const { error: tagError } = await supabase
      .from("note_tags")
      .insert(tagInserts);

    if (tagError) {
      setMsgBox({
        show: true,
        title: "Etiket Hatası",
        message: "Etiketler eklenirken hata: " + tagError.message,
        confirmText: null,
        cancelText: "Kapat",
        onCancel: () => setMsgBox(prev => ({ ...prev, show: false })),
      });
      return;
    }
  }

  const newNote = {
    id: noteId,
    notes_title: noteTitle,
    notes_content: jsonData,
    note_tags: selectedTags.map(tagId => ({
      tag_id: tagId,
      tags: userTags.find(t => t.id === tagId) || { tag_name: "" }
    }))
  };

  setNotesData(prev => [newNote, ...prev]);

  const mappedRow = {
    id: noteId,
    title: noteTitle,
    content: noteContent,
    tags: selectedTags.map(tagId => userTags.find(t => t.id === tagId)?.tag_name || "")
  };

  setRows(prevRows => {
    if (prevRows.some(r => r.id === mappedRow.id)) return prevRows;

    const newRows = [mappedRow, ...prevRows];

    if (selectedFilterTags.length === 0) {
      setRows(newRows);
    } else {
      const selectedTagNames = selectedFilterTags.map(uid =>
        userTags.find(t => t.id === uid)?.tag_name
      );
      const isAnd = selectedFilterTags.length > 1;

      const updatedFiltered = newRows.filter(row =>
        isAnd
          ? selectedTagNames.every(tag => row.tags.includes(tag))
          : selectedTagNames.some(tag => row.tags.includes(tag))
      );

      setRows(updatedFiltered);
    }

    return newRows;
  });

  clearLeftPanel();
};

// rowClick
export const rowClick = (
  row,
  { setEditNoteId, setTitle, setContent, setSelectedTags, userTags, selectedRowId, setSelectedRowId, setSelectedRow }
) => {
  if (selectedRowId === row.id) {
    // Aynı row tekrar tıklandı → deselect
    setEditNoteId(null);
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setSelectedRow(false);
    setSelectedRowId(null);
  } else {
    // Yeni row seçildi
    setEditNoteId(row.id);
    setTitle(row.title);
    setContent(row.content);

    const tagIds = row.tags
      .map(tagName => {
        const tagObj = userTags.find(t => t.tag_name === tagName);
        return tagObj ? tagObj.id : null;
      })
      .filter(Boolean);

    setSelectedTags(tagIds);
    setSelectedRow(true);
    setSelectedRowId(row.id);
  }
};


// updateNote
export const updateNote = async ({
  supabase,
  editNoteId,
  noteTitle,
  noteContent,
  selectedTags,
  userTags,
  userId,
  setNotesData,
  setRows,
  setMsgBox
}) => {
  const jsonData = { content: noteContent };

  // 1) Notu güncelle
  const { data,  error } = await supabase
    .from("notes")
    .update({ notes_title: noteTitle, notes_content: jsonData })
    .eq("id", editNoteId)
    .select()
    .single();

  if (error) {
    setMsgBox({
      show: true,
      title: "Uyarı",
      message: "Not tablosu güncellenirken hata oluştu: " + error.message,
      cancelText: "Kapat",
      onCancel: () => setMsgBox(prev => ({ ...prev, show: false }))
    });
    return;
  }

  // 2) Eski tagleri sil
  const { error: deleteError } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", editNoteId);

  if (deleteError) {
    setMsgBox({
      show: true,
      title: "Uyarı",
      message: "Eski tagler silinirken hata oluştu: " + deleteError.message,
      cancelText: "Kapat",
      onCancel: () => setMsgBox(prev => ({ ...prev, show: false }))
    });
    return;
  }

  // 3) Yeni tagleri ekle
  if (selectedTags.length > 0) {
    const inserts = selectedTags.map(tagId => ({
      note_id: editNoteId,
      tag_id: tagId,
      user_id: userId
    }));

    const { error: insertError } = await supabase
      .from("note_tags")
      .insert(inserts);

    if (insertError) {
      setMsgBox({
        show: true,
        title: "Uyarı",
        message: "Yeni tagler eklenirken hata oluştu: " + insertError.message,
        cancelText: "Kapat",
        onCancel: () => setMsgBox(prev => ({ ...prev, show: false }))
      });
      return;
    }
  }

  // 4) notesData state güncelle
  setNotesData(prev =>
    prev.map(n =>
      n.id === editNoteId
        ? {
            ...n,
            notes_title: noteTitle,
            notes_content: jsonData,
            note_tags: selectedTags.map(id => ({
              tag_id: id,
              tags: { tag_name: userTags.find(t => t.id === id)?.tag_name }
            }))
          }
        : n
    )
  );

  // 5) rows state güncelle
  const mappedRow = {
    id: editNoteId,
    title: noteTitle,
    content: noteContent,
    tags: selectedTags.map(id => userTags.find(t => t.id === id)?.tag_name)
  };

  setRows(prev => prev.map(row => (row.id === editNoteId ? mappedRow : row)));

  // 6) Formu temizle
 // clearLeftPanel();
};

// deletNote
export const deletNote = async ({
  supabase,
  editNoteId,
  notesData,
  selectedFilterTags,
  userTags,
  setNotesData,
  setRows,
  setMsgBox,
  clearLeftPanel,
   setSelectedRow
}) => {
  // 1️⃣ Notu sil
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", editNoteId);

  if (error) {
    setMsgBox({
      show: true,
      title: "Uyarı",
      message: "Not silinirken hata oluştu: " + error.message,
      confirmText: null,
      cancelText: "Kapat",
      onCancel: () => setMsgBox(prev => ({ ...prev, show: false }))
    });
    return;
  }

  // 2️⃣ notesData state güncelle
  const newNotesData = notesData.filter(note => note.id !== editNoteId);
  setNotesData(newNotesData);

  // 3️⃣ rows state güncelle
  const newRows = newNotesData.map(note => ({
    id: note.id,
    title: note.notes_title,
    content: note.notes_content?.content || "",
    tags: note.note_tags?.map(t => t.tags.tag_name) || []
  }));
setSelectedRow(false);
  // Tag filtreleme varsa uygula
  const filteredRows =
    selectedFilterTags.length === 0
      ? newRows
      : newRows.filter(row => {
          const selectedTagNames = selectedFilterTags.map(uid =>
            userTags.find(t => t.id === uid)?.tag_name
          );
          const isAnd = selectedFilterTags.length > 1;
          return isAnd
            ? selectedTagNames.every(tag => row.tags.includes(tag))
            : selectedTagNames.some(tag => row.tags.includes(tag));
        });

  setRows(filteredRows);

  // 4️⃣ Sol paneli temizle
  clearLeftPanel();

  // 5️⃣ Başarı mesajı
  setMsgBox({
    show: true,
    title: "İşlem Başarılı",
    message: "Not başarıyla silindi.",
    confirmText: null,
    cancelText: "Kapat",
    onCancel: () => setMsgBox(p => ({ ...p, show: false }))
  });
};
