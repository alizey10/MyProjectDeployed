import BaseService from "@/@services/baseService";
import { HttpStatus } from "@/utils/getStatusCode";
import { PermissionsProvider } from "@/app/hooks/permissionContext";
export default class AuthService extends BaseService {
  constructor() {
    super();
    this.controllerName = "Auth";
    this.userData = null;
  }
async GetPermissions() {
  try {
    const res = await this.Get("Permissions");

    if (res.status === HttpStatus.OK && res.data?.data) {
      return { success: true, data: res.data.data };
    }
    return { success: false, data: {} };
  } catch (err) {
    console.error("Failed to fetch permissions:", err);
    return { success: false, data: {} };
  }
}

  async login(email, password) {
    try {
      const response = await this.Post("Login", { email, password });

     if ((response.status === HttpStatus.OK || response.status === HttpStatus.Created) && response.data?.data) {
        const { accessToken, refreshToken } = response.data.data;

        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        return {
          success: true,
          message: response.data.message,
          accessToken,
          refreshToken,
          data: response.data.data,
          status: response.status
        };
      }

      return { success: false, message: response.data?.message || "Login failed", status: response.status };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || "Something went wrong", status: error?.response?.status || 500 };
    }
  }


  async logout() {
    try {
      const response = await this.Post("Logout", {}); 

      this.accessToken = null;
      this.refreshToken = null;
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");


      return {
        success: true,
        message: response.data?.message || "Logged out successfully",
        data: response.data?.data || null,
        status: response.status
      };
    } catch (error) {
      console.error("Logout error:", error);

   
      this.accessToken = null;
      this.refreshToken = null;
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      return {
        success: false,
        message: error?.response?.data?.message || "Logout failed",
        status: error?.response?.status || 500
      };
    }
  }
}
