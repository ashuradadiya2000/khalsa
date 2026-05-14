import { instance } from "./http";

type List = {
    createdBy: string
    videoId: string
    etag: string
    channelId: string
    title: string
    description: string
    channelTitle: string
    publishedAt: string
    thumbnails: Thumbnails
}
export interface Thumbnails {
    default: Default
    medium: Medium
    high: High
}

export interface Default {
    url: string
    width: number
    height: number
    _id: string
}

export interface Medium {
    url: string
    width: number
    height: number
    _id: string
}

export interface High {
    url: string
    width: number
    height: number
    _id: string
}

export const addAudio = async (data: List[]) => {
    return await instance.post("/admin/audio/create", data)
};

export const searchYoutubeAudio = async (search: string) => {
    return await instance.get("/admin/audio/search-audio?search=" + search)
};

export const getAudiolist = async () => {
    return await instance.get("/admin/audio/list")
};

export const setToSlider = async (data: { id: string, show: boolean }) => {
    return await instance.post("/admin/audio/set-slider", data)
};

export const deleteAudio = async (id: string) => {
    return await instance.delete("/admin/audio/delete/" + id)
};