import React, { JSX } from 'react'
import Button from '../../components/ui/button/Button'
import Swal from 'sweetalert2';
import { deleteProfileAvtar } from '../../services/profile';




interface IDeleteProfileAvtar {
    _id: string
    refetch: () => void
}

const DeleteProfileAvtar: React.FC<IDeleteProfileAvtar> = ({ _id, refetch }): JSX.Element => {

    const handleDelete = () => {
        const id = _id;
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this Profile avtar!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result: { isConfirmed: boolean; }) => {
            if (result.isConfirmed) {
                const { status } = await deleteProfileAvtar(id)
                if (status === 200) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Profile avtar has been deleted.",
                        icon: "success"
                    });
                    refetch()
                }
            }
        });
    }
    return (
        <Button size='sm' variant='danger' onClick={handleDelete}>Delete</Button>
    )
}

export default DeleteProfileAvtar