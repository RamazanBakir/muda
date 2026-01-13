"use client";

import { storage } from "@/shared/lib/storage";

export interface MockCategory {
    id: string;
    key: string;
    label: string;
    icon: string;
    color: string;
    enabled: boolean;
}

export interface MockUnit {
    id: string;
    name: string;
    categories: string[]; // Category keys
}

const DEFAULT_CATEGORIES: MockCategory[] = [
    { id: '1', key: 'transportation', label: 'Ulaşım & Yol', icon: 'bus', color: 'blue', enabled: true },
    { id: '2', key: 'water_sewer', label: 'Su & Kanalizasyon', icon: 'droplet', color: 'cyan', enabled: true },
    { id: '3', key: 'parks', label: 'Park & Bahçeler', icon: 'tree', color: 'green', enabled: true },
    { id: '4', key: 'waste', label: 'Temizlik & Atık', icon: 'trash', color: 'orange', enabled: true },
    { id: '5', key: 'lighting', label: 'Aydınlatma', icon: 'zap', color: 'yellow', enabled: true },
];

const DEFAULT_UNITS: MockUnit[] = [
    { id: 'unit-water', name: 'Su ve Kanalizasyon İdaresi', categories: ['water_sewer'] },
    { id: 'unit-transport', name: 'Ulaşım Dairesi', categories: ['transportation'] },
    { id: 'unit-parks', name: 'Park ve Bahçeler Md.', categories: ['parks'] },
    { id: 'unit-clean', name: 'Temizlik İşleri Md.', categories: ['waste'] },
];

class ConfigRepository {
    getCategories(): MockCategory[] {
        return storage.get<MockCategory[]>('mock_categories', DEFAULT_CATEGORIES);
    }

    saveCategories(categories: MockCategory[]) {
        storage.set('mock_categories', categories);
    }

    getUnits(): MockUnit[] {
        return storage.get<MockUnit[]>('mock_units', DEFAULT_UNITS);
    }

    saveUnits(units: MockUnit[]) {
        storage.set('mock_units', units);
    }


    reset() {
        storage.remove('mock_categories');
        storage.remove('mock_units');
    }
}

export const configRepository = new ConfigRepository();
