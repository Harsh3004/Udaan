import { endpoints } from "../api";

const {
  LOGIN_API,
  SEND_OTP_API,
  SIGN_UP_API
} = endpoints;

export const request = async (API, type, data) => {
  let body = undefined;
  let headers = {};
  if(data instanceof FormData)
    body = data
  else{
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  return await fetch(API,{
    method: type,
    headers: headers,
    credentials: "include",
    body: body
  });
} 

export const login = async (email,password,role) => {
    return await fetch(LOGIN_API,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        },
      credentials: "include",
      body: JSON.stringify({email,password,role})
    });
}

export const sendOtp = async (data) => {
  return await fetch(SEND_OTP_API,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      },
    body: JSON.stringify(data)
  });
}

export const signUp = async (payload) => {
    return await fetch(SIGN_UP_API,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
}