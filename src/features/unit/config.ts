export const UNIT_DIRECTORY = {
    teams: [
        { id: 'team-water-a', name: 'Su Arıza Ekibi A', unitId: 'unit-water' },
        { id: 'team-water-b', name: 'Kanalizasyon Ekibi', unitId: 'unit-water' },
        { id: 'team-transport-a', name: 'Yol Bakım Ekibi Kuzey', unitId: 'unit-transport' },
        { id: 'team-park-a', name: 'Park Bahçeler Ekibi', unitId: 'unit-park' },
    ],
    persons: [
        { id: 'p-ahmet', name: 'Ahmet Yılmaz (Saha Şefi)', unitId: 'unit-water' },
        { id: 'p-mehmet', name: 'Mehmet Demir (Operatör)', unitId: 'unit-transport' },
        { id: 'p-ayse', name: 'Ayşe Kaya (Mühendis)', unitId: 'unit-park' },
    ]
};

export const SLA_OPTIONS = [
    { label: '2 Saat (Acil)', value: 2 },
    { label: '6 Saat', value: 6 },
    { label: '24 Saat (1 Gün)', value: 24 },
    { label: '3 Gün', value: 72 },
    { label: '1 Hafta', value: 168 },
];
