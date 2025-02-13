import React from 'react';
import '../styles/main.css';

function AdminGuide() {
  return (
    <div className="container">
      <div className="guide-panel">
        <h2>Admin Kullanım Kılavuzu</h2>
        
        <div className="guide-section">
          <h3>1. Evrad Oluşturma</h3>
          <div className="guide-content">
            <p>➤ "Yeni Evrad Oluştur" formunu kullanın</p>
            <p>➤ Evrad adını ve hedef sayıyı girin</p>
            <p>➤ "Oluştur ve Paylaş" butonuna tıklayın</p>
            <p>➤ WhatsApp paylaşım penceresi otomatik açılacaktır</p>
          </div>
        </div>

        <div className="guide-section">
          <h3>2. Evrad Yönetimi</h3>
          <div className="guide-content">
            <p>➤ Tüm evradlar kart görünümünde listelenir</p>
            <p>➤ Her kartta evradın adı, hedef sayısı ve kalan sayı görünür</p>
            <p>➤ "Paylaş" butonu ile evradı tekrar paylaşabilirsiniz</p>
            <p>➤ "Sil" butonu ile evradı silebilirsiniz</p>
          </div>
        </div>

        <div className="guide-section">
          <h3>3. Katılımcıları Görüntüleme</h3>
          <div className="guide-content">
            <p>➤ Her evrad kartında katılımcılar listelenir</p>
            <p>➤ Katılımcının ismi ve okuma sayısı görünür</p>
            <p>➤ Evrad tamamlandığında yeşil bir bildirim görünür</p>
          </div>
        </div>

        <div className="guide-section">
          <h3>4. Güvenlik</h3>
          <div className="guide-content">
            <p>➤ Kullanıcı adı ve şifrenizi kimseyle paylaşmayın</p>
            <p>➤ Her oturumu işiniz bitince kapatın</p>
            <p>➤ Şüpheli bir durum görürseniz süper adminle iletişime geçin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGuide;
