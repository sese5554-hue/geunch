import{test}from'node:test';import assert from'node:assert/strict';import{draftSchema}from'../shared/vehicles';
const valid={name:'아반떼',year:2022,plate:'123 가 4567',neighborhood:'성수동'};
test('공백을 정리하고 연식과 차량번호를 검사한다',()=>{
  assert.equal(draftSchema.parse(valid).plate,'123가4567');
  for(const patch of [{name:' '},{year:1970},{year:9999},{plate:'abc'},{neighborhood:''}])assert.equal(draftSchema.safeParse({...valid,...patch}).success,false);
});
test('소유자나 공개 상태를 입력으로 바꿀 수 없다',()=>{
  assert.equal(draftSchema.safeParse({...valid,ownerId:'another'}).success,false);
  assert.equal(draftSchema.safeParse({...valid,status:'PUBLISHED'}).success,false);
});
