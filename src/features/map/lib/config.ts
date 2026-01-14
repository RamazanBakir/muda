export const MUG_CENTER = { lat: 37.2153, lng: 28.3636 }; // Menteşe Center
export const ZOOM_LEVEL = 13;

type TileProvider = {
    url: string;
    attribution: string;
}

export const TILE_PROVIDERS: Record<string, TileProvider> = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: 'Muğla Büyükşehir Belediyesi'
    },
    // Can add Stadia or CartoDB for cleaner look if needed later
    cartoLight: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: 'Muğla Büyükşehir Belediyesi'
    }
}
