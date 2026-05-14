import React, { JSX } from 'react'
import moment from 'moment'
import { useQuery } from '@tanstack/react-query'

import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ReusableTable, { ColumnDefinition } from '../../components/tables/Table'

import SearchAndAddAudio from './SearchAndAddAudio'
import { getAudiolist, setToSlider } from '../../services/audio'
import Switch from '../../components/form/switch/Switch'
import DeleteAudio from './DeleteAudio'

export interface TableData {
    _id: string;
    title: string;
    channelTitle: string;
    isSlider: boolean;
    createdAt: string;
    image: string;
}

const Audio: React.FC = (): JSX.Element => {

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['GET_AUDIOS'],
        queryFn: () => getAudiolist()
    })

    const changeSliderSetting = async (show: boolean, id: string) => {
        try {
            const { status } = await setToSlider({ id, show })
            if (status === 200) {
                refetch()
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const columns: ColumnDefinition<TableData>[] = [
        {
            key: "image",
            header: "Image",
            render: (value, row) => {
                return (
                    <img
                        src={value as string}
                        className='border border-gray-200 rounded-xl dark:border-gray-800'
                        alt={row.title}
                        width={100}
                        height={56}
                    />
                );
            }
        },
        {
            key: "title",
            header: "Title",
            render: (value) => <p className='line-clamp-2'>{value}</p>
        },
        {
            key: "channelTitle",
            header: "Channel",
        },
        {
            key: "createdAt",
            header: "Date",
            render: (value) => moment(value as string).format('DD-MM-YYYY hh:mm:ss A'),
        },
        {
            key: "isSlider",
            header: "Show in slider",
            render: (value, row) => (
                <Switch
                    label={value ? 'Enabled' : 'Disabled'}
                    defaultChecked={value as boolean}
                    onChange={(val) => changeSliderSetting(val, row._id)}
                />
            ),
        },
        {
            key: "_id",
            header: "Delete",
            render: (value) => (
                <DeleteAudio _id={value as string} refetch={refetch} />
            ),
        },
    ];





    return (
        <>
            <PageMeta title="Admin Dashboard" description="Admin Dashboard" />
            <PageBreadcrumb pageTitle="Audio" />
            <div className='mb-3 text-right'>
                <SearchAndAddAudio refetch={refetch} videos={data?.status == 200 ? data.data.list : []} />
            </div>
            <ReusableTable
                data={data?.data?.list}
                columns={columns}
                loading={isLoading}
                skeletonCount={5}
                key={123}
            />
        </>
    )
}

export default Audio