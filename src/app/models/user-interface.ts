export interface UserInterface {




}


export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}