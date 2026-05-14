
import { instance } from "./http";

interface SignInBody {
    email: string;
    password: string;
}


export const SignIn = async (data: SignInBody) => {
    return await instance.post("/auth/login", data)
};


