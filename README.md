# 근차 · 공용

이 폴더에서 새로 구현하는 독립 프로젝트입니다.

- 설치: npm install
- 개발: npm run dev
- 확인: npm run typecheck, npm test, npm run build
- 웹: http://127.0.0.1:5184
- API: http://127.0.0.1:3014/api/health

## 구현 순서

화면마다 PRD → 설계 → 레이아웃 → 모델 → 로직 → 확인 순서로 작업하고 실제 변경을 커밋합니다.
기존 프로젝트의 완성 소스는 가져오지 않습니다. 요구사항과 화면 시안은 참고합니다.

## 현재 구현한 기능

현재 세션의 이름·가린 전화번호·인증 상태를 보여주고 로그아웃한다.

[커밋과 확인 결과](docs/37-profile.md)

프로필 수정·면허 변경·채팅·점검·정산·문의 등 다른 공용 화면은 아직 구현하지 않았다.

## DB 준비와 실행

1. MariaDB에 전용 DB와 접속 사용자를 준비합니다.
2. .env.example을 .env로 복사하고 연결값을 입력합니다.
3. npm install
4. npm run db:migrate
5. 개발용 자료가 필요하면 .env에 DEV_SEED=true를 설정하고 npm run db:seed를 실행합니다.
6. 개발 계정 접속을 쓸 때만 DEV_LOGIN=true를 설정합니다.

개발 서버는 npm run dev로 실행합니다. 예시 차량과 개발 계정·인증은 운영 자료가 아닙니다. 실제 가입·로그인은 auth 담당과 통합할 때 연결합니다.

## 확인

- npm test: DB 없이 입력·표시 규칙과 API 상태 확인.
- npm run test:browser: .env의 DB에 연결해 Chrome에서 확인합니다. Windows는 설치된 Chrome을 사용합니다. 다른 환경은 npx playwright install chromium으로 브라우저를 준비합니다. 개발용 계정이 필요한 테스트 전에는 db:seed를 실행하세요.
- npm run build: 타입 검사와 빌드.

## PRD와 프롬프트

- 전체: [PRD와 프롬프트](PRD_프롬프트.txt)
- 화면별 만들 내용: docs/prd/
- 화면별 프롬프트: docs/prompts/
