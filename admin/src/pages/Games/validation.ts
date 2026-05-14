import * as Yup from 'yup'

export const create = Yup.object({
    name: Yup.string().required("Name is required!"),
    price: Yup.number().required("Price is required!"),
    reward: Yup.number().required("Reward is required!"),
    paid: Yup.bool().required("Paid is required!"),
    lavel: Yup.number().required("Lavel is required!"),
    image: Yup.mixed().required("Image is required!"),
})

export const edit = Yup.object({
    name: Yup.string().required("Name is required!"),
    price: Yup.number().required("Price is required!"),
    reward: Yup.number().required("Reward is required!"),
    paid: Yup.bool().required("Paid is required!"),
    lavel: Yup.number().required("Lavel is required!"),
    image: Yup.mixed(),
})