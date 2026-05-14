import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

import Button from '../../components/ui/button/Button';
import { ModalOverlay } from '../../components/ui/modal';

import { addVideosToPlaylist, searchYoutubeVideos } from '../../services/playlist';

import useDebounce from '../../utils/hooks/useDebounce';
import { RootState } from '../../store/reducers';
import { ISearchResult, Video } from './types';
import Input from '../../components/form/input/InputField';
import Checkbox from '../../components/form/input/Checkbox';


type ISearchAndAddVideo = {
    refetch: () => void
    videos: Video[]
}

const SearchAndAddVideo: React.FC<ISearchAndAddVideo> = ({ refetch, videos }) => {
    const { id } = useParams()
    const { user } = useSelector((state: RootState) => state.auth)

    const [list, setList] = useState<ISearchResult[]>([])
    const [selected, setSelected] = useState<ISearchResult[]>([])
    const [search, setSearch] = useState<string>('')
    const [show, setShow] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const value = useDebounce(search, 1500);

    const fetchVideos = async (query: string = '') => {
        setLoading(true)
        try {
            const { status, data } = await searchYoutubeVideos(query)
            if (status === 200) {
                setList(data.videos)
            }
        } catch (error: never | unknown) {
            console.error('Failed to fetch videos', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (show) {
            fetchVideos('')
        }
    }, [show])

    useEffect(() => {
        if (value.length) {
            fetchVideos(value)
        }
    }, [value])

    const handleSelect = (val: boolean, obj: ISearchResult) => {
        if (val) {
            setSelected([...selected, obj])
        } else {
            setSelected(selected.filter(item => item.id.videoId !== obj.id.videoId));
        }
    }

    const handleAddToPlaylist = async () => {
        if (selected && selected.length) {
            try {
                const list = selected.map((ele) => ({
                    createdBy: user.id,
                    videoId: ele.id.videoId,
                    etag: ele.etag,
                    channelId: ele.snippet.channelId,
                    title: ele.snippet.title,
                    description: ele.snippet.description,
                    channelTitle: ele.snippet.channelTitle,
                    publishedAt: ele.snippet.publishedAt,
                    thumbnails: ele.snippet.thumbnails,
                }))
                const { status, data } = await addVideosToPlaylist(id as string, list)
                if (status === 201) {
                    toast.success(data.message)
                    setSelected([])
                    refetch();
                    handleClose()
                }
            } catch (error) {
                console.error('Failed to fetch videos', error)
            }
        }
    }

    const handleClose = () => {
        setShow(false)
        setList([])
        setSearch('')
    }
    
    const ids = videos.map((ele) => ele.videoId)

    return (
        <>
            <Button size='sm' variant='primary' onClick={() => setShow(true)}>Add To Playlist</Button>
            <ModalOverlay
                isOpen={show}
                onClose={handleClose}
                onSave={handleAddToPlaylist}
                title='Search Videos'
                size='max-w-4xl'
            >
                <>
                    <Input
                        placeholder='Search video name or title...'
                        type='text'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            Loading ...
                        </div>
                    ) : (
                        <div className='grid gap-5 grid-cols-3 mt-3'>
                            {list && list.length > 0 ? list.map((ele: ISearchResult, i) => {
                                const checked = selected.some(item => item.id.videoId == ele.id.videoId)
                                return (
                                    <div className='space-y-5 sm:space-y-6' key={i}>
                                        <div className={
                                            "cursor-pointer rounded-2xl border-3 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden " +
                                            (checked ? 'border-blue-400' : '') +
                                            (ids.includes(ele.id.videoId) ? 'border-green-400' : '')
                                        }>
                                            <label className="border-t border-gray-100 dark:border-gray-800 relative" role='button' htmlFor={'result-' + i}>
                                                <div className="overflow-hidden rounded-lg">
                                                    <img className='w-full' src={ele.snippet.thumbnails.medium.url} />
                                                </div>
                                                <div className='absolute top-5 right-5'>
                                                    <Checkbox
                                                        className='bg-white'
                                                        id={'result-' + i}
                                                        checked={checked}
                                                        disabled={ids.includes(ele.id.videoId)}
                                                        onChange={(check) => handleSelect(check, ele)}
                                                    />
                                                </div>
                                            </label>
                                            <div className="p-4">
                                                <h3 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">{ele.snippet.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{ele.snippet.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                !loading && (
                                    <div className="col-span-3 text-center py-10 text-gray-500">
                                        No videos found. Try a different search.
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </>
            </ModalOverlay>
        </>
    )
}

export default SearchAndAddVideo