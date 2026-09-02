import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowLeft } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";


const Signup = () => {

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // file upload validation (type + size)
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setFormError("Please upload a JPG, PNG or WebP image.");
            e.target.value = null;
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFormError("Image must be smaller than 5 MB.");
            e.target.value = null;
            return;
        }
        setFormError("");
        setAvatar(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!name.trim() || !email.trim() || !password) {
            setFormError("Please fill in your name, email and password.");
            return;
        }
        if (password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }
        if (loading) return; // prevent duplicate submissions

        setLoading(true);
        const config = { headers: { "Content-Type": "multipart/form-data" } };

        const newForm = new FormData();
        newForm.append("file", avatar);
        newForm.append("name", name);
        newForm.append("email", email);
        newForm.append("password", password);

        try {
            const res = await axios.post(
                `${server}/user/create-user`,
                newForm,
                config
            );
            toast.success(res.data.message);
            setName("");
            setEmail("");
            setPassword("");
            setAvatar(null);
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "Unable to register. Please try again.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-brand hover:text-brand-dark"
                >
                    <AiOutlineArrowLeft size={18} />
                    Back to Home
                </Link>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        Create your{" "}
                        <span className="text-brand">Vendora</span> account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Join thousands of buyers and sellers today
                    </p>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form className='space-y-6' onSubmit={handleSubmit} >
                        {/* Full Name start */}
                        <div>
                            <label htmlFor="email"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Full Name
                            </label>
                            <div className='mt-1'>
                                <input type="text"
                                    name='text'
                                    autoComplete='text'
                                    required
                                    placeholder='john doe'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Full Name end */}

                        {/* Email address */}
                        <div>
                            <label htmlFor="email"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email Address
                            </label>
                            <div className='mt-1 relative'>
                                <input
                                    type="email"
                                    name='email'
                                    autoComplete='email'
                                    required
                                    placeholder='Enter valid email address'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Email address end */}
                        {/* Password start */}
                        <div>
                            <label htmlFor="password"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative'>
                                <input type={visible ? "text" : "password"}
                                    name='password'
                                    autoComplete='password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                                {visible ? (
                                    <AiOutlineEye
                                        className="absolute right-2 top-2 cursor-pointer"
                                        size={25}
                                        onClick={() => setVisible(false)}
                                    />
                                ) : (
                                    <AiOutlineEyeInvisible
                                        className="absolute right-2 top-2 cursor-pointer"
                                        size={25}
                                        onClick={() => setVisible(true)}
                                    />
                                )}

                            </div>
                        </div>
                        {/* Password end */}

                        {/* Avatar start */}
                        <div>
                            <label htmlFor="avatar"
                                className="block text-sm font-medium text-gray-700"
                            ></label>
                            <div className='mt-2 flex items-center'>
                                <span className='inline-block h-8 w-8 rounded-full overflow-hidden'>
                                    {
                                        avatar ? (
                                            <img
                                                src={URL.createObjectURL(avatar)}
                                                alt="avatar"
                                                className="h-full w-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <RxAvatar className="h-8 w-8" />
                                        )}
                                </span>
                                {/* Input file start */}
                                <label htmlFor="file-input"
                                    className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <span>Upload a file</span>
                                    <input type="file"
                                        name='avatar'
                                        id='file-input'
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleFileInputChange}
                                        className="sr-only"
                                    />
                                </label>
                                {/* Input file end */}
                            </div>
                        </div>
                        {/* Avatar end */}


                        {formError && (
                            <div
                                role="alert"
                                className="text-sm text-errorred bg-errorred-soft border border-red-200 rounded-md px-3 py-2"
                            >
                                {formError}
                            </div>
                        )}

                        <div>
                            <button
                                type='submit'
                                disabled={loading}
                                className="w-full h-[46px] flex items-center justify-center gap-2 px-4 text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {loading ? "Creating account..." : "Create account"}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>Already have an account?</span>
                            <Link to="/login" className="font-medium text-brand hover:text-brand-dark">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup



