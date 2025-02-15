import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [evradAdi, setEvradAdi] = useState('');
  const [hedefSayi, setHedefSayi] = useState('');
  const [evradlar, setEvradlar] = useState([]);

  useEffect(() => {
    // LocalStorage'dan admin ID'sini al
    const adminId = localStorage.getItem('adminId');
    const adminRole = localStorage.getItem('adminRole');
    
    if (!adminId) {
      navigate('/admin');
      return;
    }

    // Sorguyu oluştur
    let evradQuery;
    if (adminRole === 'superadmin') {
      // Süper admin tüm evradları görebilir
      evradQuery = query(
        collection(db, "evradlar"),
        orderBy("olusturulmaTarihi", "desc")
      );
    } else {
      // Normal admin sadece kendi evradlarını görebilir
      evradQuery = query(
        collection(db, "evradlar"),
        where("olusturanId", "==", adminId),
        orderBy("olusturulmaTarihi", "desc")
      );
    }

    // Verileri dinle
    const unsubscribe = onSnapshot(evradQuery, (querySnapshot) => {
      const evradlarData = [];
      querySnapshot.forEach((doc) => {
        evradlarData.push({ id: doc.id, ...doc.data() });
      });
      setEvradlar(evradlarData);
    });

    return () => unsubscribe();
  }, [navigate]);

  const evradOlustur = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem('adminId');
      
      const docRef = await addDoc(collection(db, "evradlar"), {
        adi: evradAdi,
        hedefSayi: parseInt(hedefSayi),
        kalanSayi: parseInt(hedefSayi),
        tamamlandi: false,
        olusturulmaTarihi: new Date(),
        katilimcilar: [],
        olusturanId: adminId  // Oluşturan admin'in ID'sini kaydet
      });
      
      // Development ve production için farklı URL'ler
      const isDevelopment = window.location.hostname === 'localhost';
      const protocol = isDevelopment ? 'http' : 'https';
      const host = isDevelopment ? 'localhost:3000' : window.location.host;
      
      const paylasilacakLink = `${protocol}://${host}/evrad/${docRef.id}`;
      
      // WhatsApp paylaşım metni
      const paylasilacakMetin = 
        `${evradAdi} Evradına katılmak için aşağıdaki linki tarayıcınızda açın:\n\n` +
        `${paylasilacakLink}\n\n` +
        `Not: Linki doğrudan WhatsApp'tan açmak yerine kopyalayıp tarayıcınıza yapıştırın.`;
      
      const whatsappLink = `https://wa.me/?text=${encodeURIComponent(paylasilacakMetin)}`;
      
      window.open(whatsappLink, '_blank');
      setEvradAdi('');
      setHedefSayi('');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  // Evrad silme fonksiyonu
  const handleDeleteEvrad = async (evradId) => {
    const adminId = localStorage.getItem('adminId');
    const adminRole = localStorage.getItem('adminRole');
    
    // Evradı bul
    const evrad = evradlar.find(e => e.id === evradId);
    
    // Yetki kontrolü
    if (evrad.olusturanId !== adminId && adminRole !== 'superadmin') {
      alert('Bu evradı silme yetkiniz yok!');
      return;
    }

    if (window.confirm('Bu evradı silmek istediğinize emin misiniz?')) {
      try {
        await deleteDoc(doc(db, "evradlar", evradId));
      } catch (error) {
        alert('Hata: ' + error.message);
      }
    }
  };

  // Evrad paylaşım fonksiyonu
  const handleShareEvrad = async (evrad) => {
    const adminId = localStorage.getItem('adminId');
    const adminRole = localStorage.getItem('adminRole');
    
    // Yetki kontrolü
    if (evrad.olusturanId !== adminId && adminRole !== 'superadmin') {
      alert('Bu evradı paylaşma yetkiniz yok!');
      return;
    }

    const isDevelopment = window.location.hostname === 'localhost';
    const protocol = isDevelopment ? 'http' : 'https';
    const host = isDevelopment ? 'localhost:3000' : window.location.host;
    
    const paylasilacakLink = `${protocol}://${host}/evrad/${evrad.id}`;
    
    const paylasilacakMetin = 
      `${evrad.adi} Evradına katılmak için aşağıdaki linki tarayıcınızda açın:\n\n` +
      `${paylasilacakLink}\n\n` +
      `Not: Linki doğrudan WhatsApp'tan açmak yerine kopyalayıp tarayıcınıza yapıştırın.`;
    
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(paylasilacakMetin)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <div className="header-actions">
          <h2>Yeni Evrad Oluştur</h2>
          <a href="/admin/guide" className="guide-link" target="_blank">
            📖 Kullanım Kılavuzu
          </a>
        </div>
        <form onSubmit={evradOlustur}>
          <input
            type="text"
            placeholder="Evrad Adı"
            value={evradAdi}
            onChange={(e) => setEvradAdi(e.target.value)}
          />
          <input
            type="number"
            placeholder="Hedef Sayı"
            value={hedefSayi}
            onChange={(e) => setHedefSayi(e.target.value)}
          />
          <button type="submit">Oluştur ve Paylaş</button>
        </form>

        <div className="evrad-grid">
          {evradlar.map((evrad) => (
            <div key={evrad.id} className="evrad-card">
              <h4>{evrad.adi}</h4>
              <div className="evrad-info">
                <p>Hedef: {evrad.hedefSayi}</p>
                <p>Kalan: {evrad.kalanSayi}</p>
              </div>
              <div className="evrad-actions">
                <button onClick={() => handleDeleteEvrad(evrad.id)}>Sil</button>
                {!evrad.tamamlandi && (
                  <button 
                    onClick={() => handleShareEvrad(evrad)}
                    className="share-button"
                  >
                    Paylaş
                  </button>
                )}
              </div>
              {evrad.katilimcilar.length > 0 && (
                <div className="katilimcilar">
                  <h5>Katılımcılar:</h5>
                  {evrad.katilimcilar.map((k, i) => (
                    <p key={i}>{k.isim} - {k.okumaSayisi}</p>
                  ))}
                </div>
              )}
              {evrad.tamamlandi && (
                <div className="tamamlandi">
                  🌟 Elhamdülillah! Evrad tamamlandı.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel; 