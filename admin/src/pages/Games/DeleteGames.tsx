import React, { JSX } from 'react'
import Swal from 'sweetalert2';

import Button from '../../components/ui/button/Button'

import { deleteGame } from '../../services/games';



interface IDeleteGame {
    _id: string
    refetch: () => void
}

const DeleteGame: React.FC<IDeleteGame> = ({ _id, refetch }): JSX.Element => {

    const handleDeletePlaylist = () => {
        const id = _id;
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this game!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            // cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result: { isConfirmed: boolean; }) => {
            if (result.isConfirmed) {
                const { status } = await deleteGame(id)
                if (status === 200) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your game has been deleted.",
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

export default DeleteGame