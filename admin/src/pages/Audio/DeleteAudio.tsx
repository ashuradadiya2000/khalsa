import React, { JSX } from 'react'
import Swal from 'sweetalert2';

import Button from '../../components/ui/button/Button'

import { deleteAudio } from '../../services/audio';



interface IDeleteAudio {
    _id: string
    refetch: () => void
}

const DeleteAudio: React.FC<IDeleteAudio> = ({ _id, refetch }): JSX.Element => {

    const handleDeleteAudio = () => {
        const id = _id;
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this audio!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            // cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result: { isConfirmed: boolean; }) => {
            if (result.isConfirmed) {
                const { status } = await deleteAudio(id)
                if (status === 200) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your audio has been deleted.",
                        icon: "success"
                    });
                    refetch()
                }
            }
        });
    }
    return (
        <Button size='sm' variant='danger' onClick={handleDeleteAudio}>Delete</Button>
    )
}

export default DeleteAudio