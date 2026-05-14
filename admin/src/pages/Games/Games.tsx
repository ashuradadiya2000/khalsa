import React, { JSX } from 'react'
import moment from 'moment'
import { useQuery } from '@tanstack/react-query'

import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ReusableTable, { ColumnDefinition } from '../../components/tables/Table'

import CreateGame from './CreateGames'
import EditGame from './EditGames'
import DeleteGame from './DeleteGames'

import { getGame } from '../../services/games'


interface TableDataItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  reward: number;
  paid: boolean;
  lavel: number;
  createdAt: string
  updatedAt: string;
}


const VideoPlaylist: React.FC = (): JSX.Element => {

  const { data, isLoading, refetch } = useQuery({ queryKey: ['GET_GAME'], queryFn: getGame })

  const url = import.meta.env.VITE_APP_BACKEND_MEDIA_GAMES_URL;

  const columns: ColumnDefinition<TableDataItem>[] = [
    {
      key: "image",
      header: "Image",
      render: (value) => {
        return (
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">
            <img src={url + value} alt={value as string} height={100} width={100} />
          </span>
        );
      }
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "price",
      header: "Price",
    },
    {
      key: "lavel",
      header: "Lavel",
    },
    {
      key: "reward",
      header: "Reward",
    },
    {
      key: "paid",
      header: "Paid Game",
      render(status) {
        if (status) {
          return (
            <span className='inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'>
              Yes
            </span >
          )
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
              No
            </span>
          )
        }
      },
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => {
        return (
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">
            {moment(value as string).format("DD-MM-YYYY hh:mm:ss A")}
          </span>
        );
      }
    },
    {
      key: "_id",
      header: "Action",
      width: "w-24",
      render: (_id, item) => {
        return (
          <div className='flex gap-2'>
            <EditGame refetch={refetch} row={item as TableDataItem} />
            <DeleteGame _id={_id as string} refetch={refetch} />
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
      <PageBreadcrumb pageTitle="Manage Games" />
      <div className='mb-3 text-right'>
        <CreateGame refetch={refetch} />
      </div>
      <ReusableTable data={data?.data?.list} columns={columns} loading={isLoading} skeletonCount={5} key={123} />
    </div>
  )
}

export default VideoPlaylist