import React, { JSX, useState } from 'react'

import Button from '../../components/ui/button/Button'
import { ModalOverlay } from '../../components/ui/modal'

import { createProfileAvtar } from '../../services/profile'


interface ICreateProfileAvtar {
    refetch: () => void
}

const CreateProfileAvtar: React.FC<ICreateProfileAvtar> = ({ refetch }): JSX.Element => {

    const [file, setFile] = useState<File | null>(null)
    const [show, setShow] = useState<boolean>(false)

    const handleSubmit = async () => {
        try {
            if (file) {
                const formdata = new FormData();
                formdata.append("avatar", file)
                const { status } = await createProfileAvtar(formdata)
                if (status === 201) {
                    refetch()
                    setShow(false)
                    setFile(null)
                }

            }
        } catch (err) {
            console.log("err", err);
        }
    }

    return (
        <div>
            <Button size='sm' variant='primary' onClick={() => { setShow(true) }} >Create</Button>
            <ModalOverlay isOpen={show} onClose={() => setShow(false)} onSave={handleSubmit} title='Create'>
                <div>
                    <div className='mb-4'>
                        <div className='text-center'>
                            {file && <img alt=" grid" className="mx-auto border border-gray-200 rounded-xl dark:border-gray-800" src={URL.createObjectURL(file)} width={300} />}
                        </div>
                        <label htmlFor='file' className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Upload file</label>
                        <input
                            className='focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class'
                            type='file'
                            id='file'
                            name='file'
                            onChange={(e) => {
                                if (e.target.files) setFile(e.target.files[0])
                            }}
                        />
                    </div>
                </div>
            </ModalOverlay>
        </div >
    )
}

export default CreateProfileAvtar