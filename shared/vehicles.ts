import { z } from 'zod';
export const searchSchema = z.strictObject({
  neighborhood: z.string().trim().min(1, '찾을 동네를 입력해 주세요.').max(60),
  q: z.string().trim().max(60).default(''),
  maxPrice: z.preprocess(value => value === '' || value === undefined ? undefined : value,
    z.coerce.number().int().min(0).max(10000000).optional()),
});
export type Search = z.infer<typeof searchSchema>;
export interface Vehicle {
  id: string; name: string; year: number; neighborhood: string;
  fuel: string; seats: number; dailyPrice: number;
}
export function searchParams(search: Search) {
  const params = new URLSearchParams({ neighborhood: search.neighborhood });
  if (search.q) params.set('q', search.q);
  if (search.maxPrice !== undefined) params.set('maxPrice', String(search.maxPrice));
  return params;
}
export const money = (value: number) => new Intl.NumberFormat('ko-KR').format(value);
