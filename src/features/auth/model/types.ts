export type UserRole = "citizen" | "muhtar" | "unit" | "call_center";

export interface UserSession {
    role: UserRole;
    userId: string;
    name: string;
    // Role specific fields
    neighborhoodId?: string; // for Muhtar
    unitId?: string;        // for Unit
    district?: string;      // for Muhtar/Citizen
}

export interface LoginCredentials {
    username?: string;
    code?: string;
    operatorId?: string;
    password?: string;
}

export const USER_ROLES: { label: string; value: UserRole }[] = [
    { label: "Vatandaş", value: "citizen" },
    { label: "Muhtar", value: "muhtar" },
    { label: "Birim Yetkilisi", value: "unit" },
    { label: "Çağrı Merkezi", value: "call_center" },
];
