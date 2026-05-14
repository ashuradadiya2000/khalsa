import * as Yup from 'yup'
import axios from "axios";
import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

import { EyeCloseIcon, EyeIcon } from "../../icons";
import { SignIn } from "../../services/auth";
import { authStorage } from "../../utils/login";


export default function SignInForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);

  const adminLogin = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .trim("Invalid email format")
      .required("Email is required!")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email address"),
    password: Yup.string().required("Password is required!"),
  })

  const { values, handleSubmit, handleChange, errors } = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: adminLogin,
    validateOnChange: false,
    onSubmit: async payload => {
      try {
        const { data, status } = await SignIn(payload);
        if (status === 200) {
          toast.success(data.message)
          authStorage.setAuthDetails(data.token);
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              token: data.token,
              user: data.user,
              role: data.role,
              authenticated: true
            }
          })
          navigate('/dashboard')
        } else {
          toast.error(data.message)
        }

      } catch (error: unknown) {
        console.log('error', error);
        if (axios.isAxiosError(error)) {
          toast.error(error.message)
        }
      }
    }
  });


  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 select-none">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    error={!!errors.password}
                    value={values.email}
                    name="email"
                    onChange={handleChange}
                    hint={errors.email}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      error={!!errors.password}
                      value={values.password}
                      name="password"
                      onChange={handleChange}
                      hint={errors.password}

                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
