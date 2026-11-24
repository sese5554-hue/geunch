import { z } from 'zod';

export const termsVersion = '2026-11-24';
export const terms = [
  { key: 'privacy', label: '개인정보 수집·이용', required: true },
  { key: 'thirdParty', label: '개인정보 제3자 제공', required: true },
  { key: 'locationTerms', label: '위치정보 이용약관', required: true },
  { key: 'locationCollection', label: '위치정보 수집·이용', required: true },
  { key: 'marketingApp', label: '앱 혜택 알림', required: false },
  { key: 'marketingSms', label: '문자 혜택 알림', required: false },
  { key: 'marketingEmail', label: '이메일 혜택 알림', required: false },
] as const;
export type TermKey = typeof terms[number]['key'];
export type Choices = Record<TermKey, boolean>;
export function chooseAll(value: boolean): Choices {
  return Object.fromEntries(terms.map(term => [term.key, value])) as Choices;
}
export function allChosen(choices: Choices) {
  return terms.every(term => choices[term.key]);
}
export function requiredChosen(choices: Choices) {
  return terms.every(term => !term.required || choices[term.key]);
}
export const choicesSchema = z.strictObject({
  privacy: z.literal(true), thirdParty: z.literal(true),
  locationTerms: z.literal(true), locationCollection: z.literal(true),
  marketingApp: z.boolean(), marketingSms: z.boolean(), marketingEmail: z.boolean(),
});
export const consentSchema = z.strictObject({ version: z.literal(termsVersion), choices: choicesSchema });
export interface ConsentRecord {
  id: string;
  version: string;
  choices: Choices;
  savedAt: string;
}
