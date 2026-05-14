import { instance } from "./http";



export const getProfilelist = async () => {
    return await instance.get("/admin/avatar/list")
};


export const updateProfileStatus = async (data: { id: string, active: boolean }) => {
    return await instance.patch("/admin/avatar/manage", data)
};

export const deleteProfileAvtar = async (id: string) => {
    return await instance.delete("/admin/avatar/delete/" + id,)
};

export const createProfileAvtar = async (data: FormData) => {
    return await instance.post("/admin/avatar/create", data)
};

