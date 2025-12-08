import React, { useState } from "react";
import "./SignUp.css";
import supabase from "./SupaBase";
import { Link, useNavigate } from "react-router-dom";


function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_control, setPasswordControl] = useState("");
   const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
  alert("Lütfen geçerli bir kullanıcı adı girin");
  return;
}

      if (password !== password_control) {
    alert("Parolalar eşleşmiyor!");
    return;
  }

  const {  error } = await supabase.auth.signUp({
  email: email,
  password: password,
   options: {                
    data: {
      display_name: name
    }
  }
    });

  if (error) {
    alert(error.message);
    }
  else {
      navigate("/mainPage"); 
    }

  };
   

  return (
    <div className="app-container">
      <div className="sign-up-box">
        <header className="app-header">
         <div className="logo-place"></div>
      </header>
        <h3>Kayıt ol</h3>

        <form onSubmit={handleLogin}>
          <label>Ad ve Soyad :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ad ve Soyad"
            required
          />

          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com"
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
          <label>Parola doğrulama:</label>
          <input
            type="password"
            value={password_control}
            onChange={(e) => setPasswordControl(e.target.value)}
            placeholder="Parola tekrar giriniz"
            required
          />
            <p>
            Zaten hesabın var mı? <Link to="/">Giriş Yap</Link>
          </p>
          <button type="submit">Kayıt ol </button>
        

        </form>
      </div>
    </div>
  );
}

export default SignUp;
