const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
    LOGIN_API: BASE_URL + "/auth/login",
    SEND_OTP_API: BASE_URL + "/auth/sendOtp",
    SIGN_UP_API: BASE_URL + "/auth/signUp",
}