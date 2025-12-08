import React, {useState, forwardRef, useImperativeHandle } from "react";

 const MainPage_NotesTable = forwardRef((props, ref) => {
 const { userId, userTags = [], setUserTags, supabase } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // use effect

  const tag_screen = () => {
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const editTag = (tag) => {
    setTagName(tag.tag_name); 
    setEditingTag(tag);
    setModalOpen(true);
  };


const confirmDelete = async () => {
  if (!deleteConfirm) return;

  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", deleteConfirm.id);

  if (error) {
    console.error(error.message);
    return;
  }

  // Silme başarılıysa userTags'i güncelle
  setUserTags(prevTags => prevTags.filter(t => t.id !== deleteConfirm.id));

  setDeleteConfirm(null);
};


 const saveModal = async (e) => {
    e.preventDefault()
  const cleanTag = tagName.trim();
  if (!cleanTag) {
    return;
  }
  if (!userId) {
      alert("userId yok, Supabase insert çalışamaz");
      return;
    }
 if (editingTag) {
  // Düzenleme
 await supabase
    .from("tags")
    .update({ tag_name: cleanTag })
    .eq("id", editingTag.id);


  // State güncelle
 setUserTags(prevTags =>
  prevTags.map(t =>
    t.id === editingTag.id ? { ...t, tag_name: cleanTag } : t
  )
);

  setEditingTag(null);

}
else {
    // Yeni tag ekleme
    const { data, error } = await supabase
      .from("tags")
      .insert([{ tag_name: cleanTag, user_id: userId }])
      .select();

    // Yeni tag eklendikten sonra Supabase’den tekrar çek
    if (error) {
  alert("Supabase insert error:", error.message);
  return;
}
    // Ekleme
      setUserTags(prev => [...prev, data[0]]);
  }
 setTagName("");
};

   useImperativeHandle(ref, () => ({
    openTagModal: tag_screen
  }));


    return(
        <div>
            {modalOpen && (
               <div className="modal">

           <div className="modal-content">
  <form id="modal-form-1" onSubmit={saveModal}>
    <label>Etiket adı:</label>
    <input
      type="text"
      value={tagName}
      onChange={(e) => setTagName(e.target.value)}
      placeholder="Tag yazın"
      required
    />

    <div className="tag-list-container">
      {userTags.map((tag) => (
        <div key={tag.id} className="tag-list">
          <span>{tag.tag_name}</span>
          <div className="action-button">
            <button type="button" onClick={() => editTag(tag)} className="edit-btn">Düzenle</button>
            <button type="button" onClick={() => setDeleteConfirm(tag)} className="delete-btn">Sil</button>
          </div>
        </div>
      ))}

      {deleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p style={{ textAlign: "left" }}>
              "{deleteConfirm.tag_name}" tagini silmek istediğine emin misin?
            </p>
            <button type="button" onClick={confirmDelete} className="model-button-save">Evet</button>
            <button type="button" onClick={() => setDeleteConfirm(null)} className="model-button-close">Hayır</button>
          </div>
        </div>
      )}
   </div>

             <button type="submit" form="modal-form-1" className="model-button-save">Kaydet</button>
           <button type="button" className="model-button-close" onClick={closeModal}>Pencereyi kapat</button>
          </form>
        </div>

         </div>
      )}
        </div>


    );
   
 });
  export default MainPage_NotesTable;
 
