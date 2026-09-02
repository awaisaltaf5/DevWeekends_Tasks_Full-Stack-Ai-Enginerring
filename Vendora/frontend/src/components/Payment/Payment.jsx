import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";


const Payment = () => {
    const [orderData, setOrderData] = useState([]);
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const orderData = JSON.parse(localStorage.getItem("latestOrder"));
        setOrderData(orderData);
    }, []);

    const orderDataCoupon = orderData?.couponCode || null;

    const paymentHandler = async (e) => {
        e.preventDefault();
        try {
            if (!stripe || !elements) return;

            // Send ONLY product ids + quantities — the amount is calculated on the backend
            const items = (orderData?.cart || []).map((i) => ({
                productId: i._id,
                qty: i.qty,
            }));

            const { data: intentData } = await axios.post(
                `${server}/payment/create-payment-intent`,
                { cart: items, couponCode: orderDataCoupon },
                { withCredentials: true }
            );

            const result = await stripe.confirmCardPayment(intentData.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                },
            });

            if (result.error) {
                // Payment failed / cancelled — no order is created
                toast.error(result.error.message);
                return;
            }

            if (result.paymentIntent.status === "succeeded") {
                // The backend re-verifies the PaymentIntent with Stripe before creating the order
                await axios.post(
                    `${server}/payment/create-order`,
                    {
                        paymentIntentId: result.paymentIntent.id,
                        shippingAddress: orderData?.shippingAddress,
                        couponCode: orderDataCoupon,
                        paymentMethod: "stripe",
                    },
                    { withCredentials: true }
                );
                navigate("/order/success");
                toast.success("Payment successful — order placed!");
                localStorage.setItem("cartItems", JSON.stringify([]));
                localStorage.setItem("latestOrder", JSON.stringify([]));
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment failed. Please try again.");
        }
    };


    //  Cash on Delevery Handler (COD)
    const cashOnDeliveryHandler = async (e) => {
        e.preventDefault();

        try {
            const items = (orderData?.cart || []).map((i) => ({
                productId: i._id,
                qty: i.qty,
            }));

            await axios.post(
                `${server}/payment/create-order`,
                {
                    cart: items,
                    shippingAddress: orderData?.shippingAddress,
                    couponCode: orderDataCoupon,
                    paymentMethod: "COD",
                },
                { withCredentials: true }
            );
            navigate("/order/success");
            toast.success("Order successful!");
            localStorage.setItem("cartItems", JSON.stringify([]));
            localStorage.setItem("latestOrder", JSON.stringify([]));
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not place the order.");
        }
    };


    return (
        <div className="w-full flex flex-col items-center py-8">
            <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
                <div className="w-full 800px:w-[65%]">
                    <PaymentInfo
                        user={user}
                        paymentHandler={paymentHandler}
                        cashOnDeliveryHandler={cashOnDeliveryHandler}
                    />
                </div>
                <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
                    <CartData
                        orderData={orderData}
                    />
                </div>
            </div>
        </div>
    );
};

const PaymentInfo = ({
    user,
    open,
    setOpen,
    onApprove,
    createOrder,
    paymentHandler,
    cashOnDeliveryHandler,
}) => {
    const [select, setSelect] = useState(1);



    return (
        <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
            {/* select buttons */}
            <div>
                <div className="flex w-full pb-5 border-b mb-2">
                    <div
                        className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
                        onClick={() => setSelect(1)}
                    >
                        {select === 1 ? (
                            <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
                        ) : null}
                    </div>
                    <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
                        Pay with Debit/credit card
                    </h4>
                </div>

                {/* pay with card */}
                {select === 1 ? (
                    <div className="w-full flex border-b">
                        <form className="w-full" onSubmit={paymentHandler}>
                            <div className="w-full flex pb-3">
                                <div className="w-[50%]">
                                    <label className="block pb-2">Name on Card</label>
                                    <input required
                                        value={user && user.name}
                                        className={`${styles.input} !w-[95%]`} />
                                </div>
                                <div className="w-[50%]">
                                    <label className="block pb-2">Exp Date</label>
                                    <CardExpiryElement
                                        className={`${styles.input}`}
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "19px",
                                                    lineHeight: 1.5,
                                                    color: "#444",
                                                },
                                                empty: {
                                                    color: "#3a120a",
                                                    backgroundColor: "transparent",
                                                    "::placeholder": {
                                                        color: "#444",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="w-full flex pb-3">
                                <div className="w-[50%]">
                                    <label className="block pb-2">Name On Card</label>
                                    <CardNumberElement
                                        className={`${styles.input} !h-[35px] !w-[95%]`}
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "19px",
                                                    lineHeight: 1.5,
                                                    color: "#444",
                                                },
                                                empty: {
                                                    color: "#3a120a",
                                                    backgroundColor: "transparent",
                                                    "::placeholder": {
                                                        color: "#444",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                                <div className="w-[50%]">
                                    <label className="block pb-2">CVV</label>
                                    <CardCvcElement
                                        className={`${styles.input} !h-[35px]`}
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "19px",
                                                    lineHeight: 1.5,
                                                    color: "#444",
                                                },
                                                empty: {
                                                    color: "#3a120a",
                                                    backgroundColor: "transparent",
                                                    "::placeholder": {
                                                        color: "#444",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                type="submit"
                                value="Submit"
                                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
                            />
                        </form>
                    </div>
                ) : null}
            </div>

            <br />
            {/* cash on delivery */}
            <div>
                <div className="flex w-full pb-5 border-b mb-2">
                    <div
                        className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
                        onClick={() => setSelect(3)}
                    >
                        {select === 3 ? (
                            <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
                        ) : null}
                    </div>
                    <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
                        Cash on Delivery
                    </h4>
                </div>


                {/* cash on delivery */}
                {select === 3 ? (
                    <div className="w-full flex">
                        <form className="w-full" onSubmit={cashOnDeliveryHandler}>
                            <input
                                type="submit"
                                value="Confirm"
                                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
                            />
                        </form>
                    </div>
                ) : null}
            </div>

        </div>
    );
};




const CartData = ({ orderData }) => {
    const shipping = orderData?.shipping?.toFixed(2);
    return (
        <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
            <div className="flex justify-between">
                <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
                <h5 className="text-[18px] font-[600]">${orderData?.subTotalPrice}</h5>
            </div>
            <br />
            <div className="flex justify-between">
                <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
                <h5 className="text-[18px] font-[600]">${shipping}</h5>
            </div>
            <br />
            <div className="flex justify-between border-b pb-3">
                <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
                <h5 className="text-[18px] font-[600]">{orderData?.discountPrice ? "$" + orderData.discountPrice : "-"}
                </h5>
            </div>
            <h5 className="text-[18px] font-[600] text-end pt-3">
                ${orderData?.totalPrice}
            </h5>
            <br />

        </div>
    );
};

export default Payment;