// src/helpers/tokenStorage.js

const ACCESS_TOKEN_KEY = "ytrc_portal_access_token";
const REFRESH_TOKEN_KEY = "ytrc_portal_refresh_token";

export function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setAccessToken(token) {
    try {
        if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
        else localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
        // ignore
    }
}

export function getRefreshToken() {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setRefreshToken(token) {
    try {
        if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
        else localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
        // ignore
    }
}

export function clearTokens() {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
        // ignore
    }
}