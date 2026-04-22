# CMS Auth Setup

이 저장소의 `/admin/`은 Decap CMS를 사용합니다.

## 왜 추가 설정이 필요한가

GitHub Pages는 정적 호스팅이므로, GitHub OAuth 인증 코드를 교환해 줄 서버가 없습니다.

Decap CMS 공식 문서 기준으로 GitHub 백엔드를 쓰려면 다음 중 하나가 필요합니다.

- Netlify 인증 제공자
- 별도 OAuth 프록시
- edge worker 또는 serverless auth handler

## 최소 작업 순서

1. GitHub에서 OAuth App을 만듭니다.
2. `/auth`와 `/callback` 경로를 처리하는 OAuth 프록시를 별도 도메인에 배포합니다.
3. `static/admin/config.yml`의 `backend.base_url`을 그 도메인으로 바꿉니다.

## 참고

- GitHub OAuth 공식 문서:
  [Authorizing OAuth apps](https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- Decap CMS 공식 문서:
  [GitHub backend](https://decapcms.org/docs/github-backend/)
- Decap CMS 공식 문서:
  [Backends overview](https://decapcms.org/docs/backends-overview/)
