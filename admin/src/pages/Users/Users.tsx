import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ReusableTable, { ColumnDefinition } from '../../components/tables/Table'
import Switch from '../../components/form/switch/Switch'

import { getUserslist, userProfileBlock, userProfileDelete } from '../../services/user'

export interface TableDataItem {
    _id: string
    username: string
    email: string
    role: string
    verifyed: boolean
    avatar_id: string
    reward_points: number
    createdAt: string
    block: boolean
    deleted: boolean
}
const Users: React.FC = () => {

    const { data, isLoading, refetch } = useQuery({ queryKey: ['GET_PLAYLIST'], queryFn: getUserslist })

    const { mutate } = useMutation({
        mutationKey: ['UPDATE_STATUS'],
        mutationFn: (data: { id: string, status: boolean }) => {
            return userProfileBlock(data)
        },
        onMutate: () => {
            refetch()
        }
    })
    
    const { mutateAsync } = useMutation({
        mutationKey: ['DELETE_STATUS'],
        mutationFn: (data: { id: string, status: boolean }) => {
            return userProfileDelete(data)
        },
        onMutate: () => {
            refetch()
        }
    })

    const columns: ColumnDefinition<TableDataItem>[] = [
        {
            key: "username",
            header: "Username",
        },
        {
            key: "email",
            header: "Email",
        },
        {
            key: "role",
            header: "Role",
        },
        {
            key: "reward_points",
            header: "Reward Points",
        },
        {
            key: "_id",
            header: "Block",
            render: (value, row) => (
                <Switch
                    label={value ? "" : ""}
                    defaultChecked={row.block}
                    onChange={(val) => mutate({ id: row._id, status: val })}
                />
            ),
        },
        {
            key: "_id",
            header: "Deleted",
            render: (value, row) => (
                <Switch
                    label={value ? "" : ""}
                    defaultChecked={row.deleted}
                    onChange={(val) => mutateAsync({ id: row._id, status: val })}
                />
            ),
        },
        {
            key: "verifyed",
            header: "Status",
            render(status) {
                if (status) {
                    return (
                        <span className='inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'>
                            Verify
                        </span >
                    )
                } else {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                            Pending
                        </span>
                    )
                }
            },
        },
    ]
    return (
        <>
            <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
            <PageBreadcrumb pageTitle="Users" />
            <ReusableTable data={data?.data?.list} columns={columns} loading={isLoading} skeletonCount={5} key={123} />
        </>
    )
}

export default Users