# HANO Homepage

`aiml-k.github.io`처럼 정적 생성기 기반으로 운영되는 홈페이지 구조를 참고해,
메인 / 소개 / 갤러리 / Notice 흐름과 자동 게시판 관리를 `Hugo + GitHub Pages + Decap CMS`로 다시 만든 저장소입니다.

## 구조

- `hugo.yaml`: Hugo 사이트 설정과 상단 메뉴
- `content/about/_index.md`: 소개페이지
- `content/gallery/_index.md`: 갤러리 게시판 소개
- `content/notice/_index.md`: Notice 게시판 소개
- `content/gallery/posts/*.md`: 갤러리 글
- `content/notice/posts/*.md`: 공지 글
- `layouts/`: Hugo 템플릿
- `static/`: CSS, 이미지, CMS 정적 파일
- `data/site.yaml`: 메인페이지 문구와 사이트 기본 정보
- `.github/workflows/publish.yaml`: GitHub Pages 빌드/배포

## 동작 방식

- 메인 최신 글은 `Gallery`와 `Notice` 섹션의 글을 날짜 기준으로 자동 정렬해 노출합니다.
- 게시판 목록은 해당 섹션의 글을 카드형 썸네일로 자동 렌더링합니다.
- 게시글을 추가하면 상세 페이지 URL도 자동 생성됩니다.
- 더 이상 메인 썸네일 여섯 칸이나 개별 게시글 링크를 손으로 관리할 필요가 없습니다.

## CMS

`/admin/` 경로에 Decap CMS를 붙였습니다.

관리 가능한 항목:

- `Site Settings`: 메인페이지 텍스트와 히어로 이미지
- `Pages`: 소개페이지, Gallery 소개, Notice 소개
- `Gallery`: 갤러리 글
- `Notice`: 공지 글

## 중요한 점

GitHub Pages만으로는 Decap CMS GitHub 로그인이 끝나지 않습니다.

`static/admin/config.yml`의 아래 값은 아직 자리표시자입니다.

- `backend.base_url`

이 값은 OAuth 프록시 도메인으로 교체해야 실제로 CMS 로그인이 됩니다. 자세한 내용은 [docs/cms-auth.md](docs/cms-auth.md)를 보면 됩니다.

## 로컬 실행

로컬에서 확인하려면 Hugo가 설치된 환경에서 아래처럼 실행하면 됩니다.

```bash
hugo server
```
