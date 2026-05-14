
import React, { JSX, useState } from 'react'
import Button from '../../components/ui/button/Button'
import { ModalOverlay } from '../../components/ui/modal'
import { validation } from './validation'
import { useFormik } from 'formik'
import Input from '../../components/form/input/InputField'
import { createPlaylist } from '../../services/playlist'


interface ICreateVideoPlaylist {
    refetch: () => void
}

const CreateVideoPlaylist: React.FC<ICreateVideoPlaylist> = ({ refetch }): JSX.Element => {

    const [show, setShow] = useState<boolean>(false)

    const { values, handleSubmit, handleChange, errors, resetForm } = useFormik({
        initialValues: {
            title: "",
        },
        validationSchema: validation,
        validateOnChange: false,
        onSubmit: async payload => {
            try {
                const { status } = await createPlaylist(payload)
                if (status === 201) {
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

            >Create Playlist</Button>
            <ModalOverlay isOpen={show} onClose={() => setShow(false)} onSave={handleSubmit} title='Create Playlist'>
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

export default CreateVideoPlaylist