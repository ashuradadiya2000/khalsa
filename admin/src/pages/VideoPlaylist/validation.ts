import * as Yup from 'yup'

export const validation = Yup.object({
    title: Yup.string().required("Title is required!"),
})