import { User } from "../models/User";

export default class LocalStorageUtils {
    static readonly tokenKey: string = "TASKS_TOKEN";
    static readonly userKey: string = "user";

    static setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    static getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    static deleteItem(key: string): void {
        localStorage.removeItem(key);
    }
}