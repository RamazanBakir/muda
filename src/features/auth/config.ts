
export const AUTH_CONFIG = {
    MUHTAR_USERS: [
        { username: 'muhtar_mentese', password: '123', name: 'Ahmet Yılmaz', district: 'Menteşe', neighborhood: 'Orhaniye', role: 'muhtar' as const },
        { username: 'muhtar_kobekli', password: '123', name: 'Ayşe Demir', district: 'Menteşe', neighborhood: 'Kötekli', role: 'muhtar' as const },
    ],
    UNIT_USERS: [
        { code: 'UNIT-001', password: '123', name: 'Su ve Kanalizasyon', unitId: 'unit-water', role: 'unit' as const },
        { code: 'UNIT-002', password: '123', name: 'Ulaşım Dairesi', unitId: 'unit-transport', role: 'unit' as const },
        { code: 'UNIT-003', password: '123', name: 'Park ve Bahçeler', unitId: 'unit-park', role: 'unit' as const },
    ],
    CALL_CENTER_USERS: [
        { id: 'OP-01', password: '123', name: 'Operatör 1', role: 'call_center' as const },
    ]
};
