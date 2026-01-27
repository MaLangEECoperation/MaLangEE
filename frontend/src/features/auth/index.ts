// Config (Validation constants)
export { AUTH_VALIDATION, type AuthValidation } from "./config";

// Model (Form validation schemas + Hooks)
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
  // Hooks
  useAuth,
  useLoginIdCheck,
  useNicknameCheck,
  usePasswordValidation,
} from "./model";

// API (Response/Request schemas - collocated)
export { loginResponseSchema as tokenSchema, type LoginResponse, type Token, signup } from "./api";

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

// UI
export {
  AuthGuard,
  GlobalPopup,
  GuestGuard,
  NicknameChangePopup,
  SignupPromptDialog,
  type SignupPromptDialogProps,
  TokenKeepAlive,
} from "./ui";
