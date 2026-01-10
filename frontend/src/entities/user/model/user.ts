import { z } from "zod";

/**
 * User 엔티티 Zod 스키마
 */
export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  username: z.string().min(1),
});

/**
 * User 엔티티 타입
 */
export type User = z.infer<typeof userSchema>;

/**
 * User 생성 요청 스키마
 */
export const userCreateSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  username: z
    .string()
    .min(2, "사용자명은 최소 2자 이상이어야 합니다")
    .max(20, "사용자명은 최대 20자까지 가능합니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
});

/**
 * User 생성 요청 타입
 */
export type UserCreate = z.infer<typeof userCreateSchema>;

/**
 * User 업데이트 요청 스키마
 */
export const userUpdateSchema = z.object({
  username: z.string().min(2).max(20).optional(),
  email: z.string().email().optional(),
});

/**
 * User 업데이트 요청 타입
 */
export type UserUpdate = z.infer<typeof userUpdateSchema>;
