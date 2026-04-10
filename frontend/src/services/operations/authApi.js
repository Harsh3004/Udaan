import { useSelector } from "react-redux";

export const request = async (API, type, data, token) => {
  let body = undefined;
  let headers = {};
  if (data instanceof FormData)
    body = data
  else {
    if (data !== undefined && data !== null) {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
  }

  if (token)
    headers["Authorization"] = `Bearer ${token}`;

  const options = {
    method: type,
    headers: headers,
    credentials: "include",
  };

  if (type !== 'GET' && type !== 'HEAD' && body !== undefined) {
    options.body = body;
  }

  return await fetch(API, options);
}