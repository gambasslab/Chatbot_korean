# 🐿️ 인터넷 언어 예절 챗봇 (Vercel 배포판)

바름이·준호·서연·민우·다솜이가 Gemini AI로 매번 다른 답을 합니다.
API 키는 Vercel 서버에만 저장되어 학생 기기에는 보이지 않습니다.
AI 연결이 안 되면 자동으로 기본(오프라인) 대화 모드로 작동합니다. 퀴즈방은 항상 기본 모드입니다.

## Vercel 배포 (안티그래비티 터미널)
1. 터미널에서 이 폴더로 이동: `cd "$HOME\Desktop\Antigravity\dist-chatbot"`
2. `npx vercel login` → 브라우저에서 로그인
3. `npx vercel` → 질문은 모두 Enter (프로젝트 이름만 원하면 변경)
4. API 키 등록: `npx vercel env add GEMINI_API_KEY production` → 키 붙여넣기
5. 최종 배포: `npx vercel --prod` → 나온 주소를 학생들에게 공유

## 75명 동시 사용 시 주의
- Gemini 무료 등급은 분당 요청 수가 적어(약 10회/분) 수업 중 한도를 넘을 수 있습니다.
- Google AI Studio(aistudio.google.com) → API 키 → 결제(Billing) 연결 시 한도가 크게 늘어납니다. 한 차시 75명 사용 비용은 수백 원 수준입니다.
- 한도를 넘으면 그 순간만 기본 모드 답변으로 자동 전환됩니다.
- 수업 전 화면 오른쪽 위 버튼이 `🤖 AI 연결됨`인지 확인하세요.
