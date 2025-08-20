import BaseService from "@/@services/baseService";

export default class AuthService extends BaseService {
  constructor() {
    super();
    this.controllerName = "Auth";
    this.userData = null;        
  }

  normalizeClaims(claims) {
    if (!claims) return null;
    const normalized = {};
    for (const key in claims) {
      const shortKey = key.split("/").pop();
      normalized[shortKey.toLowerCase()] = claims[key];
    }
    return normalized;
  }


  async login(email, password) {
    try {
      const response = await this.Post("Login", { email, password });

      if (response.status === 200 && response.data?.data) {
        const { accessToken, refreshToken } = response.data.data;

       
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        const meResponse = await this.Get("me");
        const cleanUser = this.normalizeClaims(meResponse?.data);

        this.userData = cleanUser;

        return {
          success: true,
          message: response.data.message,
          accessToken,
          refreshToken,
          user: cleanUser
        };
      }

      return {
        success: false,
        message: response.data?.message || "Login failed"
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again"
      };
    }
  }

  getUser() {
    return this.userData ?? null;
  }

  logout() {
    this.userData = null;
    this.accessToken = null;
    this.refreshToken = null;
  }
}
