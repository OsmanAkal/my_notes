import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import supabase from "./SupaBase";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
const handleLogin = async (e) => {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
  } else {
    navigate("/mainPage");
  }
};
  

  return (
    
    <div className="app-container">
      <div className="login-box">
        <header className="app-header">
         <div className="logo-place"></div>
      <h2>My Notes</h2>
      </header>
        <h3>Giriş Yap</h3>

        <form onSubmit={handleLogin}>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email giriniz"
            required
          />

          <label>Parola :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parola giriniz"
            required
          />
           <p>
          Hesabın yok mu?  <Link to="/signup">Kayıt Ol</Link>
          </p>
          <button type="submit">Giriş</button>
        

        </form>
      </div>
    </div>
  );
}

export default Login;
