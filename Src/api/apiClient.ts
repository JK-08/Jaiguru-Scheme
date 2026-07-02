// Src/api/apiClient.ts
//
// Generic typed request wrapper used by every service in Src/api/services.
// Modeled on the Dhanapal-DigiGold-New reference project's apiClient.ts.
import { axiosInstance } from './axiosInstance';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface ApiOptions<T> {
  method: HttpMethod;
  url: string;
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: any;
  statusCode?: number;
}

export const callApi = async <T, R>({
  method,
  url,
  data,
  params,
  headers = {},
  isFormData = false,
}: ApiOptions<T>): Promise<R> => {
  try {
    const response = await axiosInstance.request<R>({
      method,
      url,
      params,
      data,
      headers: {
        ...headers,
        ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {}),
      },
    });

    if (__DEV__) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ API SUCCESS [${method.toUpperCase()}] ${url}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const resData = error?.response?.data;

    if (__DEV__) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`❌ API FAILED [${method.toUpperCase()}] ${url}`);
      console.log('📌 Status  :', status ?? 'No response');
      console.log('💬 Message :', resData?.message ?? resData ?? error?.message ?? 'Unknown error');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    const apiError: ApiError = {
      status: 'error',
      message:
        resData?.message ||
        resData?.error ||
        resData?.errorMessage ||
        (typeof resData === 'string' ? resData : null) ||
        error?.message ||
        'Something went wrong',
      errors: resData?.errors,
      statusCode: status,
    };
    throw apiError;
  }
};
