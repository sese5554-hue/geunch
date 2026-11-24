import{test}from'node:test';import assert from'node:assert/strict';
import{searchSchema,searchParams}from'../shared/vehicles';
test('동네는 필수이고 이름과 예산은 생략할 수 있다',()=>{
  assert.equal(searchSchema.safeParse({neighborhood:' '}).success,false);
  assert.deepEqual(searchSchema.parse({neighborhood:' 성수동 ',maxPrice:''}),{neighborhood:'성수동',q:'',maxPrice:undefined});
  assert.equal(searchSchema.safeParse({neighborhood:'성수동',maxPrice:-1}).success,false);
  assert.equal(searchSchema.safeParse({neighborhood:'성수동',maxPrice:'abc'}).success,false);
});
test('예산 0도 검색 주소에 남긴다',()=>{
  const params=searchParams({neighborhood:'성수동',q:'아반떼',maxPrice:0});
  assert.equal(params.get('maxPrice'),'0');assert.equal(params.get('q'),'아반떼');
});
