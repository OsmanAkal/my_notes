import { useEffect, useState ,useRef} from 'react';
import "./MainPage.css";
import { DataGrid } from '@mui/x-data-grid';

import NotesTable from "./MainPage_NotesTable";
import MainPage_MessageBox from "./MainPage_MessageBox";


import supabase from "./SupaBase";
import { saveData, rowClick, updateNote, deletNote, handleSearchChange } from "./MainPage_Helper";




const MainPage = () => {
  
  const [noteTitle, setTitle] = useState("");
  const [noteContent, setContent] = useState("");

  const [userId, setUserId] = useState(null);
  const [userTags, setUserTags] = useState([]);
   const [userName, setUserName] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);

  const [rows, setRows] = useState([]);

  const [notesData, setNotesData] = useState([]);
  const notes_ref = useRef(null);

  const [editNoteId, setEditNoteId] = useState(null);

  const [searchText, setSearchText] = useState("")

  const [selectedRow, setSelectedRow] = useState(false);
const [selectedRowId, setSelectedRowId] = useState(null);


// search 
const searchToken = useRef(0);


  // message box
   const [msgBox, setMsgBox] = useState({
    show: false,
    title: "",
    message: "",
    confirmText: "Tamam",
    cancelText: "İptal",
    onConfirm: () => {},
    onCancel: () => {},
  });


// use effect
useEffect(() => {
  const fetchUser = async () => {
    if (!supabase || !supabase.auth || !supabase.auth.getUser) return;

    const response = await supabase.auth.getUser();
    const { data, error } = response || {}; // <- burası önemli

    if (error) {
      console.error(error);
      return;
    }

    if (data?.user) {
      setUserId(data.user.id);
    }
  };

  fetchUser();
}, []); // boş bağımlılık array’i

useEffect(() => {
  if (!userId) return;

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserName(data.full_name);
    }
  };

  fetchProfile();
}, [userId]);


useEffect(() => {
  const fetchTags = async () => {
    if (!userId) return; // userId yoksa çık

    try {
      const { data, error } = await supabase
        .from("tags")
        .select("id, tag_name")
        .eq("user_id", userId)
        .order("tag_name", { ascending: true });

      if (error) {
        console.error("Supabase fetchTags error:", error.message);
        setUserTags([]); // hata durumunda boş liste
      } else {
        setUserTags(data || []); // data yoksa boş liste
      }
    } catch (err) {
      console.error("Unexpected error fetching tags:", err);
      setUserTags([]);
    }
  };

  fetchTags();
}, [userId, supabase]);

useEffect(() => {
  const fetchNotes = async () => {
    if (!userId) return; // userId yoksa çık

    try {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          notes_title,
          notes_content,
          note_tags:note_tags!note_tags_note_id_fkey (
            tag_id,
            tags:tags!note_tags_tag_id_fkey (
              id,
              tag_name
            )
          )
        `)
        .eq("user_id", userId)
        .order("id", { ascending: false });

      if (error) {
        console.error("Supabase fetchNotes error:", error.message);
        setNotesData([]); // hata durumunda boş liste
      } else {
        setNotesData(data || []); // data yoksa boş liste
      }
    } catch (err) {
      console.error("Unexpected error fetching notes:", err);
      setNotesData([]);
    }
  };

  fetchNotes();
}, [userId, supabase]);


useEffect(() => {
  try {
    if (!notesData || !Array.isArray(notesData)) {
      setRows([]);
      return;
    }

    const mapped = notesData.map(note => ({
      id: note.id,
      title: note.notes_title,
      content: note.notes_content?.content || "",
      tags: note.note_tags?.map(t => t.tags.tag_name) || []
    }));

    setRows(mapped);
    // setFilteredRows(mapped); // İstersen aktif edebilirsin
  } catch (err) {
    console.error("Error mapping notesData:", err);
    setRows([]);
  }
}, [notesData]);

useEffect(() => {
  if (selectedFilterTags.length === 0) {
    // selectedFilterTags boşsa tüm notları göster
    const allRows = notesData.map(note => ({
      id: note.id,
      title: note.notes_title,
      content: note.notes_content?.content || "",
      tags: note.note_tags?.map(t => t.tags.tag_name) || []
    }));

    setRows(allRows);
  }
}, [selectedFilterTags, notesData]);



useEffect(() => {
  if (searchText !== undefined) {
    applyFilters(searchText);
  }
}, [searchText]);

useEffect(() => {
  if (selectedFilterTags !== undefined) {
    applyFilters(selectedFilterTags);
  }
}, [selectedFilterTags]);

useEffect(() => {
  if (notesData !== undefined) {
    applyFilters(notesData);
  }
}, [notesData]);


//tag
 const selectFilterTag = (id) => {
  setSelectedFilterTags(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)   // varsa çıkar
      : [...prev, id]                // yoksa ekle
  );
};
const selectTag = (t) => {
  setSelectedTags(prev =>
    prev.includes(t)
      ? prev.filter(x => x !== t)
      : [...prev, t]
  );
};
const applyFilters = () => {
  let list = [...notesData];

  // Search filter
  if (searchText.trim() !== "") {
    const s = searchText.toLowerCase();
    list = list.filter(n =>
      n.notes_title.toLowerCase().includes(s) ||
      n.notes_content?.content?.toLowerCase().includes(s)
    );
  }

  //  Tag filter
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

// sol panel temizleme
const clearLeftPanel = () => {
  setTitle("");
  setContent("");
  setSelectedTags([]);
  setEditNoteId(null); 
  setSelectedRow(false);
};

 // Not kaydetme
  const handleSave = (e) => {
    saveData(e, {
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
    });
  };

  // Not satırına tıklama
  const handleRowClick = (row) => {
    rowClick(row, { setEditNoteId, setTitle: setTitle, setContent: setContent, setSelectedTags, userTags });
      if (row) {
    setSelectedRow(true);
  } else {
    setSelectedRow(false);
  }
  };

  // Not güncelleme
  const handleUpdate = () => {
    updateNote({
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
    });
  };

  // Not silme
  const handleDelete = () => {
    deletNote({
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
    });
  };

//
  return (
    <div className="main-screen">

      <MainPage_MessageBox
  show={msgBox.show}
  title={msgBox.title}
  message={msgBox.message}
  confirmText={msgBox.confirmText}
  cancelText={msgBox.cancelText}
  onConfirm={msgBox.onConfirm}
  onCancel={msgBox.onCancel}
/>
        <header>
      <h2 className="h-style">Hoş geldin, {userName}</h2>
        </header>
      <div className="main-container">
      

        <div className="left-panel">
           <form id="saveData"  onSubmit={(e) =>
        handleSave(e, {
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
        })
      }></form>
           
           <h2>Oluştur & Düzenle</h2>
         
          <input
          form="saveData"
            type="text"
            value={noteTitle}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık yazın"
           required
          />
          
          <div className="tag-create">
           
            <div className="tags">
              <div> 
                  <NotesTable
                   userId={userId}
                   userTags={userTags}
                   setUserTags={setUserTags}
                    ref={notes_ref}
                     supabase={supabase}
                     />
                  <button
                   onClick={() => notes_ref.current && notes_ref.current.openTagModal()}
                   className="tag-button"
                    >
                Etiket Yönetimi
              </button>
               
                </div>
               

             <div className="tag-list-2">
        {userTags.map((tag) => (
          <div
            key={tag.id}
            className={`tag-item-2 ${
              selectedTags.includes(tag.id) ? "selected" : ""
            }`}
            onClick={() => selectTag(tag.id)}
          >
            {tag.tag_name}
          </div>
        ))}
       </div>
              
            </div>
          </div>
          <div>
            
              <textarea
              form="saveData"
              className="text-area"
              rows="20" cols="50"
                value={noteContent}
                onChange={(e) => setContent(e.target.value)}
                placeholder="İçerik yazın"
                required
                />
               
          </div>
          <button type="submit" form="saveData" className="panel-button">Kaydet</button>
          <button type="button" disabled={!selectedRow}  onClick={handleUpdate} className="panel-button">Güncelle</button>
          <button type="button" disabled={!selectedRow} onClick={handleDelete} className="panel-button">Sil</button>
          <button type="button" onClick={clearLeftPanel} className="panel-button">Temizle</button>
          
        </div>
         
        <div className="right-panel">
          <h2>Arama & Filtre</h2>

          <input type="text"  placeholder="Not ara..."   value={searchText}   onChange={(e) =>handleSearchChange({
            e,
            notesData,
            supabase,
            setRows,
            setSearchText,
            searchToken
          })
        }/>

          <div className="tags">

                <div className="tag-list-2">
         {userTags.map((tag) => (
          <div
            key={tag.id}
            className={`tag-item-2 ${
              selectedFilterTags.includes(tag.id) ? "selected" : ""
            }`}
            onClick={() => selectFilterTag(tag.id , tag.tag_name)}
          >
            {tag.tag_name}
          </div>
         ))}
         
         </div>
          </div>
          
<DataGrid
  key={rows.length} 
    onRowClick={(params) =>
      rowClick(params.row, {
      setEditNoteId,
      setTitle,
      setContent,
      setSelectedTags,
      userTags,
      selectedRowId,
      setSelectedRowId,
      setSelectedRow
    })
  }
  rows={rows}
  sx={{
    height:"350px",
    border: "1px solid #0A704D",
    fontFamily: "Arial",
    backgroundColor: "#9CA3AF",
       "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#9CA3AF",
      borderBottom: "1px solid #0A704D"
    },
   
    "& .MuiDataGrid-columnHeaderTitle": { 
      fontSize: 16 ,
      fontWeight:"bold"
    },
      "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#9CA3AF", 
      color: "var(--color-dark)",                        
      fontWeight: "bold",
      fontSize: 14
     
    },
    "& .MuiDataGrid-row": {
      cursor: "pointer",
      transition: "background-color 0.2s",
      borderBottom: "1px solid #0A704D" ,
      backgroundColor: "#D1D5DB",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "var(--color-green-light)",
    },
    "& .MuiDataGrid-cell": {
      padding: "8px"
    },
    "& .MuiDataGrid-row.Mui-selected": {
      backgroundColor: "#0A704D !important", 
      color: "white",
    },

    "& .MuiDataGrid-row.Mui-selected:hover": {
      backgroundColor: "#0F8F61 !important",
    },
  }}
  columns={[
    
    { field: "title", headerName: "Başlık",flex:1, },
    { field: "content",headerName: "İçerik",flex:2,
      renderCell: (params) => (
        <span>
          {params.value.length > 50
            ? params.value.slice(0, 50) + "..."
            : params.value}
        </span>
      )
    },
    {field: "tags",headerName: "Etiketler",flex:2,
      renderCell: (params) => (
        <div>
          {params.value.map((tag, i) => (
            <span className="tag-dataGrid" key={i}>
              {tag}
            </span>
          ))}
        </div>
      )
    }
  ]}
  pageSize={5}
/>
          </div>
           </div>
        </div>
  );
};

export default MainPage;
