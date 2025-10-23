import { useSelector } from "react-redux";

export const request = async (API, type, data,token) => {
  let body = undefined;
  let headers = {};
  if(data instanceof FormData)
    body = data
  else{
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  if (token)
    headers["Authorization"] = `Bearer ${token}`;

  return await fetch(API,{
    method: type,
    headers: headers,
    credentials: "include",
    body: body
  });
}