export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}
