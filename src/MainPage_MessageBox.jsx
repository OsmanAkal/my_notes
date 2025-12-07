import React from "react";
import "./MainPage_MessageBox.css";

export default function MainPage_MessageBox({
  show,
  title,
  message,
  confirmText = null,
  cancelText = "Kapat",
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className="msgbox-overlay">
      <div className="msgbox-container">
        <h3 className="msgbox-title">{title}</h3>
        <p className="msgbox-message">{message}</p>

     <div className="msgbox-buttons">

  {cancelText && (
    <button className="msgbox-btn cancel" onClick={onCancel}>
      {cancelText}
    </button>
  )}

  {confirmText && onConfirm && (
    <button className="msgbox-btn confirm" onClick={onConfirm}>
      {confirmText}
    </button>
  )}

</div>


      </div>
    </div>
  );
}
