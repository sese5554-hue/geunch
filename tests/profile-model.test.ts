import{test}from'node:test';import assert from'node:assert/strict';import{maskPhone,verificationStatus}from'../shared/profile';
test('전화번호 가운데를 가리고 없는 번호를 구별한다',()=>{assert.equal(maskPhone('01012345678'),'010-****-5678');assert.equal(maskPhone(''),'등록된 번호 없음');});
test('인증 완료여도 기한이 지났으면 만료로 표시한다',()=>{const now=new Date('2026-11-24T00:00:00Z');assert.equal(verificationStatus('verified',new Date('2026-11-23'),now),'expired');assert.equal(verificationStatus('verified',null,now),'verified');assert.equal(verificationStatus('pending',null,now),'pending');});
