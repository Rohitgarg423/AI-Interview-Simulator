export async function apiFetch(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  const makeRequest = (accessToken) => {
    const headers = { ...options.headers };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(url, { ...options, headers });
  };

  let res = await makeRequest(token);

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.accessToken);
      res = await makeRequest(data.accessToken);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  return res;
}