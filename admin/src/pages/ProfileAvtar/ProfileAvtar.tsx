import React from 'react'
import moment from 'moment'
import { useMutation, useQuery } from '@tanstack/react-query'

import PageMeta from '../../components/common/PageMeta'
import Switch from '../../components/form/switch/Switch'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ReusableTable, { ColumnDefinition } from '../../components/tables/Table'

import { getProfilelist, updateProfileStatus } from '../../services/profile'

import DeleteProfileAvtar from './DeleteProfileAvtar'
import CreateProfileAvtar from './CreateProfileAvtar'


export interface TableData {
    _id: string;
    filename: string;
    createdAt: string;
    isActive: boolean;
}



const ProfileAvtar: React.FC = () => {

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['GET_AVATAR'],
        queryFn: () => getProfilelist()
    })

    const { mutate } = useMutation({
        mutationKey: ['UPDATE_STATUS'],
        mutationFn: (data: { id: string, active: boolean }) => {
            return updateProfileStatus(data)
        },
        onMutate: () => {
            refetch()
        }
    })

    const url = import.meta.env.VITE_APP_BACKEND_MEDIA_AVATAR_URL;

    const columns: ColumnDefinition<TableData>[] = [
        {
            key: "filename",
            header: "Image",
            render: (value, row) => {
                return (
                    <img
                        src={url + value as string}
                        className='border border-gray-200 rounded-xl dark:border-gray-800'
                        alt={row.filename}
                        width={100}
                        height={56}
                    />
                );
            }
        },
        {
            key: "createdAt",
            header: "Date",
            render: (value) => moment(value as string).format('DD-MM-YYYY hh:mm:ss A'),
        },
        {
            key: "isActive",
            header: "Show in profile setting",
            render: (value, row) => (
                <Switch
                    label={value ? 'Enabled' : 'Disabled'}
                    defaultChecked={value as boolean}
                    onChange={(val) => mutate({ id: row._id, active: val })}
                />
            ),
        },
        {
            key: "_id",
            header: "Action",
            width: "w-24",
            render: (_id) => <DeleteProfileAvtar _id={_id as string} refetch={refetch} />,
        },
    ]

    return (
        <>
            <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
            <PageBreadcrumb pageTitle="Profile Picture" />
            <div className='mb-3 text-right'>
                <CreateProfileAvtar refetch={refetch} />
            </div>
            <ReusableTable
                data={data?.data?.list || []}
                columns={columns}
                loading={isLoading}
                skeletonCount={5}
                key={123}
            />
        </>
    )
}

export default ProfileAvtar