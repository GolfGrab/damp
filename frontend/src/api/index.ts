import axios from "axios";
import {
  ApplicationModuleApi,
  AuthApi,
  MainModuleApi,
  NotificationModuleApi,
  UserModuleApi,
} from "./generated";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

export const apiClient = {
  MainModuleApi: new MainModuleApi(undefined, undefined, axiosInstance),
  NotificationModuleApi: new NotificationModuleApi(
    undefined,
    undefined,
    axiosInstance
  ),
  UserModuleApi: new UserModuleApi(undefined, undefined, axiosInstance),
  ApplicationModuleApi: new ApplicationModuleApi(
    undefined,
    undefined,
    axiosInstance
  ),
  AuthApi: new AuthApi(undefined, undefined, axiosInstance),
};
