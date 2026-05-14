
import { getCookie, setCookie, eraseCookie } from "./cookies";
class AuthStorage {
    private key = import.meta.env.VITE_APP_ACCESS_TOKEN_KEY;
    get authToken() {
        return getCookie(this.key);
    }
    setAuthDetails = (accessToken: string) => {
        setCookie(this.key, accessToken, 1);
    };
    deleteAuthDetails = () => {
        eraseCookie(this.key);
    };
}
export const authStorage = new AuthStorage();