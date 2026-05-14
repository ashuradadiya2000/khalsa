
import { instance } from "./http";



export const createGame = async (data: FormData) => {
    return await instance.post("/admin/games/create", data)
};
export const editGame = async (data: FormData) => {
    return await instance.patch("/admin/games/edit", data)
};
export const deleteGame = async (id: string) => {
    return await instance.delete("/admin/games/delete/" + id)
};
export const getGame = async () => {
    return await instance.get("/admin/games/list")
};

