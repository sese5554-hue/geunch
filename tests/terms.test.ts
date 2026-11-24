import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseAll, allChosen, requiredChosen, consentSchema, termsVersion } from '../shared/terms';

test('전체 선택 후 한 항목을 풀면 전체 선택도 풀린다', () => {
  const choices = chooseAll(true);
  assert.equal(allChosen(choices), true);
  choices.marketingSms = false;
  assert.equal(allChosen(choices), false);
  assert.equal(requiredChosen(choices), true);
  assert.equal(allChosen(chooseAll(false)), false);
});
test('필수만 골라도 저장할 수 있고 선택 동의는 강요하지 않는다', () => {
  const choices = { ...chooseAll(false), privacy: true, thirdParty: true, locationTerms: true, locationCollection: true };
  assert.equal(requiredChosen(choices), true);
  assert.equal(consentSchema.safeParse({ version: termsVersion, choices }).success, true);
});
test('필수 누락, 잘못된 자료형, 모르는 항목, 이전 버전은 거절한다', () => {
  assert.equal(consentSchema.safeParse({ version: termsVersion, choices: { ...chooseAll(true), privacy: false } }).success, false);
  assert.equal(consentSchema.safeParse({ version: termsVersion, choices: { ...chooseAll(true), marketingApp: 'false' } }).success, false);
  assert.equal(consentSchema.safeParse({ version: termsVersion, choices: { ...chooseAll(true), extra: true } }).success, false);
  assert.equal(consentSchema.safeParse({ version: 'old', choices: chooseAll(true) }).success, false);
});
