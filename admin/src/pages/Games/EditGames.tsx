
import React, { JSX, useState } from 'react'
import { useFormik } from 'formik'

import Button from '../../components/ui/button/Button'
import Input from '../../components/form/input/InputField'
import { ModalOverlay } from '../../components/ui/modal'
import Switch from '../../components/form/switch/Switch'

import { editGame } from '../../services/games'

import { edit } from './validation'

interface IEditGame {
    refetch: () => void
    row: {
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
}

const EditGame: React.FC<IEditGame> = ({ refetch, row }): JSX.Element => {

    const [show, setShow] = useState<boolean>(false)

    const url = import.meta.env.VITE_APP_BACKEND_MEDIA_GAMES_URL;

    const { values, handleSubmit, handleChange, setFieldValue, errors, resetForm } = useFormik({
        initialValues: {
            ...row,
        },
        validationSchema: edit,
        validateOnChange: false,
        enableReinitialize: true,
        onSubmit: async payload => {
            try {
                const formdata = new FormData();

                formdata.append('_id', payload._id)
                formdata.append('name', payload.name)
                formdata.append('price', String(payload.price))
                formdata.append('reward', String(payload.reward))
                formdata.append('paid', String(payload.paid))
                formdata.append('lavel', String(payload.lavel))

                if (payload.image && typeof payload.image === 'object') {
                    formdata.append('image', payload.image);
                }

                const { status } = await editGame(formdata)

                if (status === 200) {
                    setShow(false)
                    refetch()
                    resetForm()
                }
            } catch (error) {
                console.log("error", error);
            }
        }
    })
    console.log("values.image", typeof values.image);

    return (
        <div>
            <Button
                size='sm'
                variant='primary'
                onClick={() => {
                    setShow(true)
                    resetForm()
                }}
            >Edit</Button>
            <ModalOverlay isOpen={show} onClose={() => setShow(false)} onSave={handleSubmit} title='Edit Playlist'>
                <div>
                    <div className='mb-4'>
                        <Input
                            id='name'
                            name='name'
                            value={values.name}
                            placeholder='Enter Name'
                            onChange={handleChange}
                            error={!!errors.name}
                            hint={errors.name}
                        />
                    </div>
                    <div className='mb-4'>
                        <Input
                            id='price'
                            name='price'
                            type='number'
                            value={values.price}
                            placeholder='Enter Price'
                            onChange={handleChange}
                            error={!!errors.price}
                            hint={errors.price}
                        />
                    </div>
                    <div className='mb-4'>
                        <Input
                            id='reward'
                            name='reward'
                            type='number'
                            value={values.reward}
                            placeholder='Enter Reward'
                            onChange={handleChange}
                            error={!!errors.reward}
                            hint={errors.reward}
                        />
                    </div>
                    <div className='mb-4'>
                        <Input
                            id='lavel'
                            name='lavel'
                            type='number'
                            value={values.lavel}
                            placeholder='Enter Lavel'
                            onChange={handleChange}
                            error={!!errors.lavel}
                            hint={errors.lavel}
                        />
                    </div>
                    <div className='mb-4'>
                        <div className='text-center'>
                            {values.image && typeof values.image === "object" && <>
                                <img
                                    alt="imagte"
                                    className="mx-auto border border-gray-200 rounded-xl dark:border-gray-800"
                                    src={URL.createObjectURL(values.image)}
                                    width={150}
                                />
                            </>}
                            {values.image && typeof values.image === "string" && <>
                                <img
                                    alt="imagte"
                                    className="mx-auto border border-gray-200 rounded-xl dark:border-gray-800"
                                    src={url + values.image}
                                    width={150}
                                />
                            </>}
                        </div>
                        <label htmlFor='file' className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Upload </label>
                        <input
                            className='focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class'
                            type='file'
                            id='file'
                            name='file'
                            onChange={(e) => {
                                if (e.target.files) setFieldValue("image", e.target.files[0])
                            }}
                        />
                    </div>
                    <div className='mb-4'>
                        <Switch
                            label={'Paid'}
                            defaultChecked={values.paid}
                            onChange={(check) => setFieldValue('paid', check)}
                        />
                    </div>
                </div>
            </ModalOverlay>
        </div >
    )
}

export default EditGame