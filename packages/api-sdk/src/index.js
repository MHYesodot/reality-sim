import ky from 'ky';
import { io } from 'socket.io-client';
export function createHttp(baseURL, token) {
    return ky.create({
        prefixUrl: baseURL.replace(/\/$/, ''),
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
}
export function createRealtime(url, token) {
    return io(url, { transports: ['websocket'], auth: token ? { token } : undefined });
}
