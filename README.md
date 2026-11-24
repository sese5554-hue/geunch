# 근차 · 회원가입·로그인

이 폴더에서 새로 구현하는 독립 프로젝트입니다.

- 설치: npm install
- 개발: npm run dev
- 확인: npm run typecheck, npm test, npm run build
- 웹: http://127.0.0.1:5181
- API: http://127.0.0.1:3011/api/health

## 약관 화면 실행

MariaDB에 전용 데이터베이스를 준비한 다음 `.env.example`을 `.env`로 복사하고 연결 정보를 입력합니다. 실제 비밀번호는 Git에 올리지 않습니다.

1. `npm install`
2. `npm run db:migrate`
3. `npm run dev`

현재 구현한 화면은 약관 동의입니다. 다른 가입·로그인 화면은 아직 구현 전입니다.

## 확인

- `npm test`: 동의 규칙과 API 테스트. DB 없이 실행합니다.
- `npm run test:database`: `.env`에 지정한 MariaDB에 실제 저장하고 새 연결에서 다시 읽습니다. 테스트가 만든 기록만 삭제합니다.
- `npm run test:browser`: 테스트용 저장소로 Chrome에서 선택·저장·새로고침·오류·재시도를 확인합니다. Windows는 설치된 Chrome을 사용합니다. 다른 환경에서는 `npx playwright install chromium`을 먼저 실행합니다.
- 확인한 화면: [저장 완료](docs/screenshots/00-terms.png), [저장 실패](docs/screenshots/00-terms-error.png).

## 구현 순서

화면마다 PRD → 설계 → 레이아웃 → 모델 → 로직 → 확인 순서로 작업하고 실제 변경을 커밋합니다.
기존 프로젝트의 완성 소스는 가져오지 않습니다. 요구사항과 화면 시안은 참고합니다.

## 만들 내용과 부탁할 말

- 전체: [PRD와 프롬프트](PRD_프롬프트.txt)
- 화면별 만들 내용: docs/prd/
- 화면별 부탁할 말: docs/prompts/
