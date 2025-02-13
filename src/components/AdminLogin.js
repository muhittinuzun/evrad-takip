import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Önce admins koleksiyonunda kullanıcıyı ara
      const adminQuery = await getDocs(query(collection(db, 'admins'), 
        where('username', '==', username),
        where('password', '==', password)
      ));

      if (!adminQuery.empty) {
        const adminDoc = adminQuery.docs[0];
        const adminData = adminDoc.data();
        
        // Süper admin kontrolü
        if (adminData.role === 'superadmin') {
          navigate('/superadmin/panel');
        } else {
          navigate('/admin/panel');
        }
        
        // Admin bilgilerini localStorage'a kaydet
        localStorage.setItem('adminId', adminDoc.id);
        localStorage.setItem('adminRole', adminData.role);
      } else {
        alert('Kullanıcı adı veya şifre hatalı!');
      }
    } catch (error) {
      alert('Giriş başarısız: ' + error.message);
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h2>Admin Girişi</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin; 