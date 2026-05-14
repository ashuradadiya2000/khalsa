import { instance } from "./http";



export const getUserslist = async () => {
    return await instance.get("/admin/user/list")
};

export const userProfileBlock = async (data: { id: string; status: boolean; }) => {
    return await instance.post("/admin/user/block", data)
};
export const userProfileDelete = async (data: { id: string; status: boolean; }) => {
    return await instance.post("/admin/user/delete", data)
};
