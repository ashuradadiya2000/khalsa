import React, { JSX } from 'react'
import moment from 'moment'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ReusableTable, { ColumnDefinition } from '../../components/tables/Table'

import CreateVideoPlaylist from './CreateVideoPlaylist'
import EditVideoPlaylist from './EditVideoPlaylist'
import DeleteVideoPlaylist from './DeleteVideoPlaylist'

import { getPlaylist } from '../../services/playlist'


import Button from '../../components/ui/button/Button'


interface TableDataItem {
  _id: string;
  title: string;
  subtitle: string;
  total_video: string;
  username: string;
  createdAt: string;
}



const VideoPlaylist: React.FC = (): JSX.Element => {
  const navigate = useNavigate()



  const { data, isLoading, refetch } = useQuery({ queryKey: ['GET_PLAYLIST'], queryFn: getPlaylist })

  const columns: ColumnDefinition<TableDataItem>[] = [
    {
      key: "title",
      header: "Title",
    },
    {
      key: "username",
      header: "Created By",
    },
    {
      key: "total_video",
      header: "Total video",
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (date: string) => (
        <span className="text-gray-500 text-theme-sm dark:text-gray-400">
          {moment(date).format("DD/MM/YYYY hh:mm:ss A")}
        </span>
      ),
    },
    {
      key: "_id",
      header: "Action",
      width: "w-24",
      render: (_id: string, item: TableDataItem) => {
        return (
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' onClick={() => navigate('/video-playlist/' + _id)}>Manage</Button>
            <EditVideoPlaylist refetch={refetch} title={item.title} _id={_id} />
            <DeleteVideoPlaylist _id={_id} refetch={refetch} />
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
      <PageBreadcrumb pageTitle="Video Playlist" />
      <div className='mb-3 text-right'>
        <CreateVideoPlaylist refetch={refetch} />
      </div>
      <ReusableTable data={data?.data?.list} columns={columns} loading={isLoading} skeletonCount={5} key={123} />
    </div>
  )
}

export default VideoPlaylist