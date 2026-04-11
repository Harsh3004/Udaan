import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, resetCart } from '../../../slices/cartSlice';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, total, totalItems } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-[calc(100vh-3.5rem)] text-white bg-rich-black-900 font-inter py-10 px-4 md:px-8 xl:px-16 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-10 mt-4">
                
                {/* Header Section */}
                <div className="border-b border-rich-black-700 pb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-300 tracking-tight mb-2 pb-2">
                        Your Learning Cart
                    </h1>
                    <p className="text-rich-black-300 text-lg mt-5 flex items-center gap-2 font-medium">
                        <span className="bg-rich-black-800 text-rich-black-50 px-3 py-1 rounded-full text-sm font-bold border border-rich-black-700 shadow-inner">
                            {totalItems}
                        </span> 
                        {totalItems === 1 ? 'Course' : 'Courses'} currently in your cart
                    </p>
                </div>

                {totalItems > 0 ? (
                    <div className="flex flex-col xl:flex-row gap-10">
                        {/* Cart Items Area */}
                        <div className="flex-1 flex flex-col gap-6">
                            {cart.map((course, index) => {
                                const cover = typeof course.thumbnail === 'string' ? course.thumbnail : course.thumbnail?.url || '';
                                const rating = course.avgRating || 
                                    (course.ratingAndReviews?.length 
                                        ? (course.ratingAndReviews.reduce((a, b) => a + (b.rating || 0), 0) / course.ratingAndReviews.length).toFixed(1) 
                                        : "0.0");
                                
                                return (
                                    <div key={index} className="group relative flex flex-col sm:flex-row gap-6 bg-rich-black-800/40 backdrop-blur-md p-5 rounded-[2rem] border border-rich-black-700 hover:border-rich-black-500 hover:bg-rich-black-800/80 transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
                                        
                                        {/* Subtle background glow on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] pointer-events-none"></div>

                                        {/* Image Section */}
                                        <div 
                                            className="w-full sm:w-[260px] aspect-video rounded-2xl overflow-hidden shrink-0 cursor-pointer relative shadow-inner"
                                            onClick={() => navigate(`/course/${course._id}`)}
                                        >
                                            <img src={cover} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                            {/* Gradient overlay on image */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-rich-black-900/80 via-rich-black-900/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300"></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 flex flex-col justify-between py-1 z-10">
                                            <div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <h2 
                                                        className="text-2xl font-bold text-rich-black-5 group-hover:text-yellow-50 cursor-pointer transition-colors duration-300 leading-tight line-clamp-2"
                                                        onClick={() => navigate(`/course/${course._id}`)}
                                                    >
                                                        {course.title}
                                                    </h2>
                                                    <div className="text-3xl font-extrabold text-yellow-50 whitespace-nowrap drop-shadow-md">
                                                        ₹ {course.price}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-pictonBlue-400 mt-2 tracking-wide uppercase">
                                                    {course?.category?.name || "Premium Course"}
                                                </p>
                                                
                                                {/* Rating */}
                                                <div className="flex items-center gap-2 mt-3 bg-rich-black-900/50 w-fit px-3 py-1.5 rounded-full border border-rich-black-700">
                                                    <span className="text-yellow-100 font-bold text-sm tracking-widest">{rating}</span>
                                                    <div className="flex text-yellow-50 gap-1 drop-shadow-lg">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(parseFloat(rating)) ? 'fill-yellow-50' : 'fill-rich-black-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-6 flex flex-wrap gap-4 items-center">
                                                <button 
                                                    className="group/btn relative px-5 py-2.5 rounded-xl text-sm font-bold text-pink-200 bg-rich-black-900 border border-rich-black-700 hover:border-pink-500 overflow-hidden transition-all duration-300"
                                                    onClick={() => dispatch(removeFromCart(course._id))}
                                                >
                                                    <div className="absolute inset-0 w-0 bg-pink-500/10 group-hover/btn:w-full transition-all duration-300 ease-out"></div>
                                                    <div className="relative flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        Remove
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <div className="flex justify-start mt-2">
                                <button 
                                    className="text-rich-black-400 font-semibold hover:text-rich-black-50 transition-colors flex items-center gap-2 pb-1 border-b border-transparent hover:border-rich-black-50"
                                    onClick={() => dispatch(resetCart())}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Checkout Sidebar */}
                        <div className="xl:w-[400px] shrink-0">
                            <div className="bg-gradient-to-b from-rich-black-800 to-rich-black-800/50 p-8 rounded-[2.5rem] border border-rich-black-700 sticky top-[100px] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                                
                                {/* Decorative background elements for premium feel */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-50/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pictonBlue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                <h3 className="text-xl font-bold text-rich-black-5 mb-8 flex items-center gap-3 relative z-10">
                                    <svg className="w-6 h-6 text-yellow-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Order Summary
                                </h3>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-end border-b border-rich-black-700 pb-4">
                                        <p className="text-rich-black-200 font-medium text-lg">Total Value:</p>
                                        <div className="text-right">
                                            <p className="text-4xl font-extrabold text-yellow-50 drop-shadow-sm">₹ {total}</p>
                                            <p className="text-rich-black-400 font-medium text-sm mt-1 line-through decoration-rich-black-500 decoration-2">₹ {total * 2}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 text-sm text-rich-black-300 flex items-start gap-3 bg-rich-black-900/50 p-4 rounded-xl border border-rich-black-700">
                                        <svg className="w-5 h-5 text-pastelGreen-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <p>By completing your purchase, you agree to these <span className="text-yellow-50 hover:underline cursor-pointer">Terms of Service</span>.</p>
                                    </div>

                                    <button 
                                        className="w-full bg-gradient-to-r from-yellow-50 to-yellow-100 text-rich-black-900 font-extrabold py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(255,193,7,0.6)] flex justify-center items-center gap-2 mt-4"
                                        onClick={() => alert("Payment logic will be integrated here shortly.")}
                                    >
                                        Proceed to Checkout
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 bg-rich-black-800/30 backdrop-blur-sm rounded-[3rem] border border-dashed border-rich-black-700 p-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rich-black-800/10 via-transparent to-transparent pointer-events-none"></div>
                        <div className="w-32 h-32 bg-rich-black-900 rounded-full flex items-center justify-center border border-rich-black-700 shadow-inner relative z-10">
                            <svg className="w-16 h-16 text-rich-black-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <div className="text-center space-y-2 relative z-10">
                            <h2 className="text-3xl font-bold text-rich-black-50">Your cart is empty</h2>
                            <p className="text-rich-black-300 text-lg">Looks like you haven't added any courses yet.</p>
                        </div>
                        <button 
                            className="mt-6 bg-rich-black-50 text-rich-black-900 font-bold py-4 px-10 rounded-xl hover:bg-yellow-50 hover:scale-[1.03] transition-all duration-300 shadow-[0_5px_20px_-5px_rgba(255,255,255,0.2)] flex items-center gap-2 relative z-10"
                            onClick={() => navigate('/browse')}
                        >
                            Explore Courses
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
