import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { server } from "../server";
import axios from 'axios';
import { AiOutlineArrowLeft, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

const SellerActivationPage = () => {
    const { activation_token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading | success | error

    useEffect(() => {
        let cancelled = false;
        if (activation_token) {
            const activate = async () => {
                try {
                    await axios.post(`${server}/shop/activation`, { activation_token });
                    if (!cancelled) setStatus("success");
                } catch (err) {
                    if (!cancelled) setStatus("error");
                }
            };
            activate();
        } else {
            setStatus("error");
        }
        return () => { cancelled = true; };
    }, [activation_token]);

    useEffect(() => {
        if (status === "success") {
            const t = setTimeout(() => navigate("/shop-login"), 2500);
            return () => clearTimeout(t);
        }
    }, [status, navigate]);

    const states = {
        loading: {
            icon: (
                <svg className="animate-spin h-12 w-12 text-brand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ),
            title: "Activating your shop...",
            text: "Please wait a moment while we set up your seller account.",
            color: "text-brand",
        },
        success: {
            icon: <AiOutlineCheckCircle className="h-14 w-14 text-green-600" aria-hidden="true" />,
            title: "Your shop is live!",
            text: "Your seller account has been activated successfully. Redirecting you to seller sign in...",
            color: "text-green-700",
        },
        error: {
            icon: <AiOutlineCloseCircle className="h-14 w-14 text-errorred" aria-hidden="true" />,
            title: "Activation link is invalid or expired",
            text: "Activation links expire after 5 minutes. Please register your shop again to receive a new link.",
            color: "text-errorred",
        },
    };
    const s = states[status];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <Link to="/" className="text-2xl font-bold text-brand mb-8" aria-label="Vendora home">
                Vendora
            </Link>
            <div
                role="status"
                aria-live="polite"
                className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-10 flex flex-col items-center text-center gap-4"
            >
                {s.icon}
                <h1 className={`text-xl font-semibold ${s.color}`}>{s.title}</h1>
                <p className="text-sm text-gray-500 leading-relaxed">{s.text}</p>

                {status === "success" ? (
                    <Link
                        to="/shop-login"
                        className="mt-2 w-full h-[46px] flex items-center justify-center text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark transition-colors"
                    >
                        Continue to seller sign in
                    </Link>
                ) : status === "error" ? (
                    <div className="mt-2 w-full flex flex-col gap-2">
                        <Link
                            to="/shop-create"
                            className="w-full h-[46px] flex items-center justify-center text-sm font-medium rounded-lg text-white bg-brand hover:bg-brand-dark transition-colors"
                        >
                            Register again
                        </Link>
                        <Link
                            to="/"
                            className="w-full h-[46px] flex items-center justify-center gap-2 text-sm font-medium rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <AiOutlineArrowLeft size={16} />
                            Back to Home
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default SellerActivationPage





