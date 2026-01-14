export const STRINGS = {
    common: {
        loading: "Yükleniyor...",
        error: "Bir hata oluştu",
        save: "Kaydet",
        cancel: "İptal",
        back: "Geri",
        empty: "Veri bulunamadı",
        actions: "İşlemler",
    },
    status: {
        created: "Oluşturuldu",
        triaged: "Değerlendirildi",
        in_progress: "İşleme Alındı",
        resolved: "Çözüldü",
    },
    priority: {
        high: "Yüksek",
        medium: "Orta",
        low: "Düşük",
    },
    category: {
        transportation: "Ulaşım & Yol",
        water_sewer: "Su & Kanalizasyon",
        parks: "Park & Bahçeler",
        waste: "Temizlik & Atık",
        // Keeping legacy keys mapping to 'Diğer' or similar to prevent runtime crash if old data persists, 
        // strictly though TS will complain if they are not in type.
        // But since we are indexing with issue.category which IS strictly typed, we only need keys that exist in Type.
    },
    roles: {
        citizen: "Vatandaş",
        muhtar: "Muhtar",
        unit: "Birim",
        call_center: "Çağrı Merkezi",
    },
    issue: {
        createTitle: "Yeni Sorun Bildir",
        myIssues: "Taleplerim",
        neighborhoodIssues: "Mahalle Talepleri",
        unitInbox: "Birim Gelen Kutusu",
        allIssues: "Tüm Talepler",
        assignTo: "Birime Ata",
        setPriority: "Öncelik Belirle",
        changeStatus: "Durum Değiştir",
    }
};
