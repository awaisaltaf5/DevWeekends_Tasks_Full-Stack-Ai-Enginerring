import React, { useState, useEffect, useRef } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowLeft } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxAvatar } from 'react-icons/rx';


const ShopCreate = () => {

    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState();
    const [address, setAddress] = useState("");
    const [zipCode, setZipCode] = useState();
    const [avatar, setAvatar] = useState();
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
         const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const googleButtonRef = useRef(null);

    // Google Sign-Up — reuses the same GSI loader as Login.jsx
    useEffect(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) return;

                const handleGoogleResponse = async (response) => {
            try {
                const res = await axios.post(
                    `${server}/shop/google-shop-signup`,
                    {
                        credential: response.credential,
                        name,
                        address,
                        zipCode,
                        phoneNumber,
                    },
                    { withCredentials: true }
                );
                const message = res.data?.message;
                if (res.data?.shop || res.data?.requiresActivation) {
                    toast.success(res.data.message || "Shop created successfully!");
                    if (res.data.activationUrl) {
                        window.location.href = res.data.activationUrl;
                    } else {
                        navigate("/shop-login");
                        window.location.reload();
                    }
                } else {
                    toast.success(message || "Shop created successfully!");
                    navigate("/shop-login");
                    window.location.reload();
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Google signup failed");
            }
        };

        const renderGoogleButton = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 360,
                    text: "signup_with",
                });
            }
        };

        if (window.google?.accounts?.id) {
            renderGoogleButton();
                } else {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = renderGoogleButton;
            document.body.appendChild(script);
        }
    }, [name, address, zipCode, phoneNumber]);

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
        if (!name.trim() || !email.trim() || !password || !address || !zipCode || !phoneNumber) {
            setFormError("Please fill in all required fields.");
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
        newForm.append("zipCode", zipCode);
        newForm.append("address", address);
        newForm.append("phoneNumber", phoneNumber);

        try {
            const res = await axios.post(
                `${server}/shop/create-shop`,
                newForm,
                config
            );
            toast.success(res.data.message);
            navigate("/shop-login");
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "Unable to register your shop. Please try again.";
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
                        Open your{" "}
                        <span className="text-brand">Vendora</span> shop
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Reach millions of buyers — it takes just a few minutes
                    </p>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-[35rem]'>
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form className='space-y-6' onSubmit={handleSubmit} >
                        {/* Shop Name */}
                        <div>
                            <label htmlFor="name"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Shop name
                            </label>
                            <div className='mt-1'>
                                <input type="name"
                                    name='name'
                                    required

                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Phon number */}
                        <div>
                            <label htmlFor="password"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Phone Number
                            </label>
                            <div className='mt-1 relative'>
                                <input
                                    type="number"
                                    name='phone-number'
                                    autoComplete='tel'
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Phone number end */}

                        {/* Email start */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="address"
                                    name="address"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* ZipCode */}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Zip Code
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="zipcode"
                                    required
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={visible ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

                        <div>
                            <label
                                htmlFor="avatar"
                                className="block text-sm font-medium text-gray-700"
                            ></label>
                            <div className="mt-2 flex items-center">
                                <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                                    {avatar ? (
                                        <img
                                            src={URL.createObjectURL(avatar)}
                                            alt="avatar"
                                            className="h-full w-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <RxAvatar className="h-8 w-8" />
                                    )}
                                </span>
                                <label
                                    htmlFor="file-input"
                                    className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        type="file"
                                        name="avatar"
                                        id="file-input"
                                        onChange={handleFileInputChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        </div>





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
                                {loading ? "Creating your shop..." : "Create my shop"}
                            </button>
                        </div>

                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>Already have a shop?</span>
                            <Link to="/shop-login" className="font-medium text-brand hover:text-brand-dark">
                                Sign in
                            </Link>
                        </div>

                        {/* Google Sign-Up */}
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                            <span className="relative flex items-center w-full">
                                <span className="flex-grow border-t border-gray-200"></span>
                                <span className="px-3 text-xs text-gray-500">Or continue with</span>
                                <span className="flex-grow border-t border-gray-200"></span>
                            </span>
                            <div ref={googleButtonRef} className="w-full max-w-sm"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShopCreate





