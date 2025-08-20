import axios from "axios";

export default class BaseService {
  constructor(accessToken, refreshToken, refreshAccessToken) {
    this.controllerName = "Account";
    this.baseHeaders = { "Content-Type": "application/json" };
    this.timeout = 60000;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.refreshAccessToken = refreshAccessToken;

    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS,
      timeout: this.timeout,
      headers: this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {},
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          this.refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            let newAccessToken = null;

            if (this.refreshAccessToken) {
              newAccessToken = await this.refreshAccessToken();
            } else {
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS}/Auth/Refresh`,
                { refreshToken: this.refreshToken }
              );
              if (res?.data?.success) {
                newAccessToken = res.data.data.accessToken;
                this.refreshToken =
                  res.data.data.refreshToken || this.refreshToken;
              }
            }

            if (!newAccessToken) throw new Error("Token refresh failed");

            this.accessToken = newAccessToken;
            originalRequest.headers["Authorization"] = `Bearer ${this.accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token expired. Please login again.");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async assembleHeaders() {
    const headers = { ...this.baseHeaders };
    if (this.accessToken) headers["Authorization"] = `Bearer ${this.accessToken}`;
    return headers;
  }

  assembleEndpoint(action, data) {
    const apiAddress = process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS;
    let endpoint = action
      ? `${apiAddress}/${this.controllerName}/${action}`
      : `${apiAddress}/${this.controllerName}`;

    if (data) endpoint = `${endpoint}?${new URLSearchParams(data).toString()}`;

    return endpoint;
  }

  async Get(action, params) {
    const headers = await this.assembleHeaders();
    return this.client.get(this.assembleEndpoint(action, params), { headers });
  }

  async Post(action, body) {
    const headers = await this.assembleHeaders();
    return this.client.post(this.assembleEndpoint(action), body, { headers });
  }

  async Put(action, body) {
    const headers = await this.assembleHeaders();
    return this.client.put(this.assembleEndpoint(action), body, { headers });
  }

  async Patch(action, body) {
    const headers = await this.assembleHeaders();
    return this.client.patch(this.assembleEndpoint(action), body, { headers });
  }

  async Delete(action) {
    const headers = await this.assembleHeaders();
    return this.client.delete(this.assembleEndpoint(action), { headers });
  }
}
