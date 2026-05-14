import React, { JSX } from 'react'
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { MdDeleteForever } from "react-icons/md";

import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import SearchAndAddVideo from './SearchAndAddVideo';

import { deletePlaylistVideos, getPlaylistVideos } from '../../services/playlist';
import { Video } from './types';
import Swal from 'sweetalert2';



const ManagePlaylist: React.FC = (): JSX.Element => {

    const { id } = useParams()

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['GET_PLAYLIST_VIDEOS'],
        queryFn: () => getPlaylistVideos(id as string)
    })

    const handleDeleteVideo = async (vid: string) => {

        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this video!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            // cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result: { isConfirmed: boolean; }) => {
            if (result.isConfirmed) {
                const { status } = await deletePlaylistVideos(vid, id as string)
                if (status === 200) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Video has been deleted.",
                        icon: "success"
                    });
                    refetch()
                }
            }
        });
    }

    return (
        <>
            <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
            <PageBreadcrumb pageTitle="Manage Playlist" />
            <div className='mb-3 pb-3 flex items-center justify-between border-b border-gray-200'>
                <p className='text-md font-normal'>{data?.data?.list?.[0]?.title}</p>
                <SearchAndAddVideo refetch={refetch} videos={data?.status == 200 ? data.data.list[0].videos : []} />
            </div>
            <div className='grid gap-5 grid-cols-4'>
                {
                    !isLoading && data && data.data && data.data.list[0].videos.map((ele: Video, i: number) => {

                        return (
                            <div className='space-y-5 sm:space-y-6' key={i}>
                                <div className={"rounded-2xl border-3 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden"}>
                                    <label className="cursor-pointer border-t border-gray-100 dark:border-gray-800 relative" role='button'>
                                        <div className="overflow-hidden rounded-lg">
                                            <img className='w-full' src={ele.thumbnails.medium.url} />
                                        </div>
                                        <div className='absolute top-5 right-5 bg-white p-1 rounded'>
                                            <MdDeleteForever size={24} fill='red' role='button' onClick={() => handleDeleteVideo(ele._id)} />
                                        </div>
                                    </label>
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">{ele.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{ele.description}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default ManagePlaylist