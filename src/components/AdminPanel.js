import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import '../styles/main.css';

function AdminPanel() {
  const [evradAdi, setEvradAdi] = useState('');
  const [hedefSayi, setHedefSayi] = useState('');
  const [evradlar, setEvradlar] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "evradlar"), orderBy("olusturulmaTarihi", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const evradlarData = [];
      querySnapshot.forEach((doc) => {
        evradlarData.push({ id: doc.id, ...doc.data() });
      });
      setEvradlar(evradlarData);
    });
    return () => unsubscribe();
  }, []);

  const evradOlustur = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "evradlar"), {
        adi: evradAdi,
        hedefSayi: parseInt(hedefSayi),
        kalanSayi: parseInt(hedefSayi),
        tamamlandi: false,
        olusturulmaTarihi: new Date(),
        katilimcilar: []
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

  return (
    <div className="container">
      <div className="admin-panel">
        <h2>Yeni Evrad Oluştur</h2>
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

        <div className="evrad-list">
          <h3>Evradlar</h3>
          {evradlar.map((evrad) => (
            <div key={evrad.id} className="evrad-card">
              <h4>{evrad.adi}</h4>
              <div className="evrad-info">
                <p>Hedef: {evrad.hedefSayi}</p>
                <p>Kalan: {evrad.kalanSayi}</p>
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