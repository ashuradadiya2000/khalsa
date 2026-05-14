
import { instance } from "./http";

interface IBody {
    title: string;
}


export const createPlaylist = async (data: IBody) => {
    return await instance.post("/admin/playlist/create", data)
};
export const editPlaylist = async (data: IBody) => {
    return await instance.patch("/admin/playlist/edit", data)
};
export const deletePlaylist = async (id: string) => {
    return await instance.delete("/admin/playlist/delete/" + id)
};
export const getPlaylist = async () => {
    return await instance.get("/admin/playlist/list")
};


export const getPlaylistVideos = async (id: string) => {
    return await instance.get("/admin/video/playlist-videos/" + id)
};

export const deletePlaylistVideos = async (vid: string, id: string) => {
    return await instance.delete(`/admin/video/delete-videos/${vid}/${id}`)
};

export const searchYoutubeVideos = async (search: string) => {
    return await instance.get("/admin/video/search-video?search=" + search)
};

export const addVideosToPlaylist = async (id: string, data: unknown) => {
    return await instance.post("/admin/video/add-to-playlist/" + id, data)
};