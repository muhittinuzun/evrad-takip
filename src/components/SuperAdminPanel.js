import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import '../styles/main.css';

function SuperAdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

  // Adminleri getir
  useEffect(() => {
    const q = query(collection(db, "admins"), orderBy("username"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const adminList = [];
      querySnapshot.forEach((doc) => {
        adminList.push({ id: doc.id, ...doc.data() });
      });
      setAdmins(adminList);
    });
    return () => unsubscribe();
  }, []);

  // Yeni admin ekle
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "admins"), {
        ...newAdmin,
        role: 'admin',
        createdAt: new Date()
      });
      setNewAdmin({ username: '', password: '' });
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  // Admin sil
  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Bu admini silmek istediğinize emin misiniz?')) {
      try {
        await deleteDoc(doc(db, "admins", adminId));
      } catch (error) {
        alert('Hata: ' + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <h2>Admin Yönetimi</h2>
        
        {/* Yeni Admin Ekleme Formu */}
        <form onSubmit={handleAddAdmin}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
          />
          <button type="submit">Admin Ekle</button>
        </form>

        {/* Admin Listesi */}
        <div className="admin-list">
          <h3>Adminler</h3>
          <div className="admin-grid">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card">
                <h4>{admin.username}</h4>
                <div className="admin-actions">
                  <button onClick={() => handleDeleteAdmin(admin.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminPanel; 