export const request = async (API, type, data) => {
  let body = undefined;
  let headers = {};
  if(data instanceof FormData)
    body = data
  else{
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return await fetch(API,{
    method: type,
    headers: headers,
    credentials: "include",
    body: body
  });
}