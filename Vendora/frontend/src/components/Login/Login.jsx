import React, { useState, useEffect, useRef } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowLeft } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";


const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const googleButtonRef = useRef(null);

    // Google Sign-In (Google Identity Services)
    useEffect(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        const handleGoogleResponse = async (response) => {
            try {
                await axios.post(
                    `${server}/user/google-login`,
                    { credential: response.credential },
                    { withCredentials: true }
                );
                toast.success("Login Successful!");
                navigate("/");
                window.location.reload();
            } catch (err) {
                toast.error(err.response?.data?.message || "Google login failed");
            }
        };

        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleResponse,
                });
                if (googleButtonRef.current) {
                    window.google.accounts.id.renderButton(
                        googleButtonRef.current,
                        { theme: "outline", size: "large", width: 360, text: "continue_with" }
                    );
                }
            }
        };

        if (window.google?.accounts?.id) {
            initGoogle();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!email.trim() || !password) {
            setFormError("Please enter both your email and password.");
            return;
        }
        if (loading) return; // prevent duplicate submissions
        setLoading(true);

        try {
            await axios.post(
                `${server}/user/login-user`,
                { email, password },
                { withCredentials: true }
            );
            toast.success("Login Successful!");
            navigate("/");
            window.location.reload(true);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Unable to log in. Please try again.";
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
                    Welcome back to{" "}
                    <span className="text-brand">Vendora</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Sign in to continue shopping
                </p>
            </div>
            <div className='mt-8 sm:mx-auto sw:w-full sm:max-w-md'>
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form className='space-y-6' onSubmit={handleSubmit} >
                        {/* Email */}
                        <div>
                            <label htmlFor="email"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email address
                            </label>
                            <div className='mt-1'>
                                <input type="email"
                                    name='email'
                                    autoComplete='email'
                                    required
                                    placeholder='Please enter valid email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />

                            </div>
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="password"
                                className='block text-sm font-medium text-gray-700'
                            >
                                password
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
                        {/* password end */}

                        <div className={`${styles.noramlFlex} justify-between`}>
                            <div className={`${styles.noramlFlex}`}>
                                <input
                                    type="checkbox"
                                    name="remember-me"
                                    id="remember-me"
                                    className="h-4 w-4 accent-brand border-line rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remember me
                                </label>
                            </div>
                            <div className='text-sm'>
                                <Link
                                    to="/faq"
                                    className="font-medium text-brand hover:text-brand-dark"
                                >
                                    Need help?
                                </Link>
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
                                className="group relative w-full h-[46px] flex items-center justify-center gap-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>New to Vendora?</span>
                            <Link
                                to="/sign-up"
                                className="font-medium text-brand hover:text-brand-dark"
                            >
                                Create an account
                            </Link>
                        </div>

                        {/* Google Sign-In */}
                        <div className="flex justify-center pt-2">
                            <div ref={googleButtonRef}></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login