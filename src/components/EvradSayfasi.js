import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import '../styles/main.css';

function EvradSayfasi() {
  const { evradId } = useParams();
  const [evrad, setEvrad] = useState(null);
  const [isim, setIsim] = useState('');
  const [okumaSayisi, setOkumaSayisi] = useState('');

  useEffect(() => {
    const evradGetir = async () => {
      const docRef = doc(db, "evradlar", evradId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvrad(docSnap.data());
      }
    };
    evradGetir();
  }, [evradId]);

  const katilimEkle = async (e) => {
    e.preventDefault();
    if (!isim || !okumaSayisi) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    const docRef = doc(db, "evradlar", evradId);
    const yeniKalanSayi = evrad.kalanSayi - parseInt(okumaSayisi);
    
    try {
      await updateDoc(docRef, {
        kalanSayi: yeniKalanSayi,
        katilimcilar: arrayUnion({
          isim: isim,
          okumaSayisi: parseInt(okumaSayisi)
        }),
        tamamlandi: yeniKalanSayi <= 0
      });
      
      setIsim('');
      setOkumaSayisi('');
      window.location.reload();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  if (!evrad) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      <div className="evrad-sayfasi">
        <h2>{evrad.adi}</h2>
        <div className="evrad-bilgi">
          <p>Hedef Sayı: {evrad.hedefSayi}</p>
          <p>Kalan Sayı: {evrad.kalanSayi}</p>
        </div>
        
        {evrad.tamamlandi ? (
          <div className="tamamlandi">
            🌟 Elhamdülillah! Evrad tamamlandı.<br/>
            Allah kabul etsin.
          </div>
        ) : (
          <form onSubmit={katilimEkle}>
            <input
              type="text"
              placeholder="İsminiz"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
            />
            <input
              type="number"
              placeholder="Kaç kez okuyacaksınız?"
              value={okumaSayisi}
              onChange={(e) => setOkumaSayisi(e.target.value)}
            />
            <button type="submit">Kaydet</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EvradSayfasi; 