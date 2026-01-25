// Model (Form validation schemas)
export {
  // Schemas
  loginSchema,
  registerSchema,
  nicknameUpdateSchema,
  userSchema,
  // Types
  type LoginFormData,
  type RegisterFormData,
  type NicknameUpdateFormData,
  type User,
  // Token utilities
  tokenStorage,
} from "./model";

// API (Response/Request schemas - collocated)
export { loginResponseSchema as tokenSchema, type LoginResponse, type Token } from "./api";

// Query (React Query hooks)
export {
  AuthQueries,
  useLogin,
  useSignup,
  useLogout,
  useDeleteUser,
  useCheckLoginId,
  useCheckNickname,
  useUpdateUser,
  useCurrentUser,
} from "./query";

// Hooks
export { useAuth, useLoginIdCheck, useNicknameCheck, usePasswordValidation } from "./hook";

// UI
export {
  AuthGuard,
  GuestGuard,
  NicknameChangePopup,
  SignupPromptDialog,
  type SignupPromptDialogProps,
  TokenKeepAlive,
} from "./ui";
