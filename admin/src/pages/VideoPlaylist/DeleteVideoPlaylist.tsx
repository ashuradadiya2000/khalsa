import React, { JSX } from 'react'
import Button from '../../components/ui/button/Button'
import Swal from 'sweetalert2';
import { deletePlaylist } from '../../services/playlist';



interface IDeleteVideoPlaylist {
    _id: string
    refetch: () => void
}

const DeleteVideoPlaylist: React.FC<IDeleteVideoPlaylist> = ({ _id, refetch }): JSX.Element => {

    const handleDeletePlaylist = () => {
        const id = _id;
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this playlist!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            // cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result: { isConfirmed: boolean; }) => {
            if (result.isConfirmed) {
                const { status } = await deletePlaylist(id)
                if (status === 200) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your playlist has been deleted.",
                        icon: "success"
                    });
                    refetch()
                }
            }
        });
    }
    return (
        <Button size='sm' variant='danger' onClick={handleDeletePlaylist}>Delete</Button>
    )
}

export default DeleteVideoPlaylist