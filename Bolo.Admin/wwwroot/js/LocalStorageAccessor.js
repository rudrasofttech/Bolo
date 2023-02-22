export function get(key) {
    return window.localStorage.getItem(key);
}

export function set(key, value) {
    window.localStorage.setItem(key, value);
}

export function clear() {
    window.localStorage.clear();
}

export function remove(key) {
    window.localStorage.removeItem(key);
}

export function getSessionItem(key) {
    return window.sessionStorage.getItem(key);
}

export function setSessionItem(key, value) {
    window.sessionStorage.setItem(key, value);
}

export function clearSessionStorage() {
    window.sessionStorage.clear();
}

export function removeSessionItem(key) {
    window.sessionStorage.removeItem(key);
}