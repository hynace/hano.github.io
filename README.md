# Personal GitHub.io Blog Template

GitHub Pages에서 바로 사용할 수 있는 **개인 홈페이지 + 게시판형 블로그** 템플릿입니다.

## 구성 파일

- `index.html`: 메인 페이지 (게시판 링크 + 최신 글 목록 + 글 작성 UI)
- `board.html`: 게시판별 글 목록
- `post.html`: 게시글 상세
- `data/posts.json`: 기본 게시판/게시글 데이터 소스
- `assets/app.js`: 데이터 로딩, 렌더링, 브라우저 저장(localStorage) 로직
- `assets/styles.css`: 공통 스타일

## 메인에서 바로 글 작성하기

메인 페이지의 `새 글 작성` 폼에서 글을 등록할 수 있습니다.

- 등록된 글은 브라우저의 `localStorage`에 저장됩니다.
- 저장 즉시 메인 최신 글 목록/게시판 목록/상세 페이지에 반영됩니다.
- 다른 브라우저나 기기에서는 공유되지 않습니다.

## 게시판 추가 방법

`data/posts.json`의 `boards` 배열에 아래 형식으로 추가합니다.

```json
{ "key": "travel", "label": "여행기록" }
```

## 기본 게시글 추가 방법

`data/posts.json`의 `posts` 배열에 아래 형식으로 추가합니다.

```json
{
  "id": "my-post-id",
  "board": "devlog",
  "title": "글 제목",
  "date": "2026-04-21",
  "content": ["문단 1", "문단 2"]
}
```

- `board`는 `boards[].key`와 동일해야 합니다.
- 메인 페이지 최신 글 목록은 모든 게시판의 글을 날짜순으로 자동 표시합니다.

## GitHub Pages 배포

1. 이 저장소를 GitHub에 push
2. 저장소 Settings → Pages 진입
3. Source를 현재 브랜치(예: `main`)의 `/ (root)`로 선택
4. 배포 완료 후 `https://<username>.github.io/<repo>/` 접속
