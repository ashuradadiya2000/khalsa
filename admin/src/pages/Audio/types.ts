export interface ISearchResult {
    kind: string
    etag: string
    id: Id
    snippet: Snippet
}

export interface Id {
    kind: string
    videoId: string
}

export interface Snippet {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: Thumbnails
    channelTitle: string
    liveBroadcastContent: string
    publishTime: string
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