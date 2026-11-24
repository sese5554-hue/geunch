import { z } from 'zod';
export const draftSchema = z.strictObject({
  name: z.string().trim().min(1, '차 이름을 입력해 주세요.').max(80),
  year: z.coerce.number().int().min(1980, '연식을 확인해 주세요.').max(new Date().getFullYear() + 1, '연식을 확인해 주세요.'),
  plate: z.string().transform(value => value.replace(/\s/g, '')).pipe(z.string().regex(/^\d{2,3}[가-힣]\d{4}$/, '차량번호를 확인해 주세요.')),
  neighborhood: z.string().trim().min(1, '동네를 입력해 주세요.').max(60),
});
export type DraftInput = z.infer<typeof draftSchema>;
export interface VehicleDraft extends DraftInput { id: string; status: 'DRAFT'; createdAt: string }
