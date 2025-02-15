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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const evradRef = doc(db, "evradlar", evradId);
      const evradDoc = await getDoc(evradRef);
      const evradData = evradDoc.data();
      
      // Mevcut toplam okuma sayısını hesapla
      const mevcutToplam = evradData.katilimcilar.reduce((toplam, k) => toplam + k.okumaSayisi, 0);
      
      // Yeni eklenen sayı ile toplam hedefi geçiyor mu kontrol et
      if (mevcutToplam + parseInt(okumaSayisi) > evradData.hedefSayi) {
        alert(`Hedef sayıyı aşamazsınız! Kalan okuma sayısı: ${evradData.hedefSayi - mevcutToplam}`);
        return;
      }

      // Katılımcı daha önce giriş yapmış mı kontrol et
      const katilimciIndex = evradData.katilimcilar.findIndex(k => k.isim === isim);

      let yeniKatilimcilar;
      if (katilimciIndex === -1) {
        // Yeni katılımcı
        yeniKatilimcilar = [
          ...evradData.katilimcilar,
          { isim, okumaSayisi: parseInt(okumaSayisi) }
        ];
      } else {
        // Mevcut katılımcı - önceki okumasını çıkar, yeni okumayı ekle
        const eskiOkuma = evradData.katilimcilar[katilimciIndex].okumaSayisi;
        const yeniToplam = mevcutToplam - eskiOkuma + parseInt(okumaSayisi);
        
        if (yeniToplam > evradData.hedefSayi) {
          alert(`Hedef sayıyı aşamazsınız! Kalan okuma sayısı: ${evradData.hedefSayi - (mevcutToplam - eskiOkuma)}`);
          return;
        }
        
        yeniKatilimcilar = evradData.katilimcilar.map((k, i) => 
          i === katilimciIndex ? { ...k, okumaSayisi: parseInt(okumaSayisi) } : k
        );
      }

      // Yeni toplam okuma sayısını hesapla
      const yeniToplam = yeniKatilimcilar.reduce((toplam, k) => toplam + k.okumaSayisi, 0);
      
      // Evradı güncelle
      await updateDoc(evradRef, {
        katilimcilar: yeniKatilimcilar,
        kalanSayi: evradData.hedefSayi - yeniToplam,
        tamamlandi: yeniToplam >= evradData.hedefSayi
      });

      // Formu temizle
      setIsim('');
      setOkumaSayisi('');
      
      // Evrad tamamlandıysa bildir
      if (yeniToplam >= evradData.hedefSayi) {
        alert('🌟 Elhamdülillah! Evrad tamamlandı.');
      }
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  if (!evrad) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      <div className="evrad-sayfasi">
        <h2>{evrad.adi}</h2>
        <div className="evrad-info">
          <p>Hedef: {evrad.hedefSayi}</p>
          <p>Kalan: {evrad.kalanSayi}</p>
        </div>

        {evrad.tamamlandi ? (
          <div className="tamamlandi">
            🌟 Elhamdülillah! Evrad tamamlandı.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="İsminiz"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Okuma Sayısı"
              value={okumaSayisi}
              onChange={(e) => setOkumaSayisi(e.target.value)}
              required
            />
            <button type="submit">Kaydet</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EvradSayfasi; 