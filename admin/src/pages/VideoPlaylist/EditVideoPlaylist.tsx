
import React, { JSX, useState } from 'react'
import Button from '../../components/ui/button/Button'
import { ModalOverlay } from '../../components/ui/modal'
import { validation } from './validation'
import { useFormik } from 'formik'
import Input from '../../components/form/input/InputField'
import { editPlaylist } from '../../services/playlist'

interface IEditVideoPlaylist {
    refetch: () => void
    _id: string
    title: string
}

const EditVideoPlaylist: React.FC<IEditVideoPlaylist> = ({ refetch, title, _id }): JSX.Element => {

    const [show, setShow] = useState<boolean>(false)

    const { values, handleSubmit, handleChange, errors, resetForm } = useFormik({
        initialValues: {
            _id,
            title,
        },
        validationSchema: validation,
        validateOnChange: false,
        enableReinitialize: true,
        onSubmit: async payload => {
            try {
                const { status } = await editPlaylist(payload)
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
                            id='title'
                            name='title'
                            value={values.title}
                            placeholder='Enter Title'
                            onChange={handleChange}
                            error={!!errors.title}
                            hint={errors.title}
                        />
                    </div>
                </div>
            </ModalOverlay>
        </div >
    )
}

export default EditVideoPlaylist