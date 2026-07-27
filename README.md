# BK-luv-EH.github.io

모바일 청첩장. 빌드 과정 없이 GitHub Pages에서 그대로 서비스됩니다.

## 내용 수정

- 이름 / 날짜 / 예식장: `js/main.js` 상단의 `CONFIG`
- 인사말, 가족 정보, 교통편, 계좌번호: `index.html`
- 사진: `images/gallery/` 에 `1.jpg` ~ `6.jpg`

## 방명록

방명록은 저장소를 갈아끼울 수 있게 되어 있습니다. `js/guestbook.js` 상단의
`GUESTBOOK_CONFIG.backend` 값으로 선택합니다.

| 값 | 저장 위치 | 용도 |
| --- | --- | --- |
| `local` | 브라우저 localStorage | 설정 없이 바로 동작. 글을 쓴 기기에서만 보이므로 디자인 확인용입니다. |
| `firebase` | Firestore | 실제 배포용. 모든 하객이 같은 방명록을 봅니다. |

### Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만듭니다.
2. **Firestore Database**를 생성합니다 (프로덕션 모드, 위치는 `asia-northeast3`).
3. 프로젝트 설정 > 내 앱 > 웹 앱을 추가하고 발급된 설정값을
   `js/guestbook.js`의 `GUESTBOOK_CONFIG.firebase`에 붙여넣습니다.
4. `GUESTBOOK_CONFIG.backend`를 `'firebase'`로 바꿉니다.
5. Firestore 규칙을 아래처럼 설정합니다.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbook/{entry} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'message', 'passwordHash', 'createdAt'])
                    && request.resource.data.keys().hasAll(['name', 'message', 'passwordHash', 'createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.name.size() <= 10
                    && request.resource.data.message is string
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 300
                    && request.resource.data.passwordHash is string
                    && request.resource.data.createdAt is int;
      allow delete: if true;
      allow update: if false;
    }
  }
}
```

`GUESTBOOK_CONFIG.adminPassword`에 값을 넣어두면 그 비밀번호로 아무 글이나
삭제할 수 있습니다.

**주의:** 방명록 비밀번호 확인은 브라우저에서 이루어집니다. 비밀번호 원문 대신
SHA-256 해시만 저장하므로 남의 글 내용을 훔쳐볼 수는 없지만, 위 규칙은 삭제
요청 자체를 막지는 않습니다. 개발자 도구를 다룰 줄 아는 사람은 규칙을 우회해
남의 글을 지울 수 있으니, 이를 완전히 막으려면 Cloud Functions 같은 서버측
검증이 필요합니다. 하객 대상 청첩장에서는 통상 이 정도로 충분합니다.

## 로컬 미리보기

이 PC에는 Node/Python이 없어 PowerShell 정적 서버(`.claude/serve.ps1`)를 씁니다.

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1 -Port 4173
```
