export type VerificationStatus = 'pending' | 'verified' | 'expired';
export interface Verification { kind: 'identity' | 'neighborhood' | 'license'; status: VerificationStatus; development: boolean }
export interface Profile { id: string; name: string; phone: string; activeRole: 'guest' | 'host'; verifications: Verification[] }
export const verificationLabels = { identity: '본인 확인', neighborhood: '동네 인증', license: '운전면허' };
export const statusLabels = { pending: '확인 전', verified: '완료', expired: '만료' };
export function maskPhone(phone: string) { return /^01\d{8,9}$/.test(phone) ? `${phone.slice(0,3)}-****-${phone.slice(-4)}` : '등록된 번호 없음'; }
export function verificationStatus(status: string, expiresAt: Date | null, now = new Date()): VerificationStatus {
  if (status !== 'verified') return 'pending';
  return expiresAt && expiresAt <= now ? 'expired' : 'verified';
}
