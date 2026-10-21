# 🐿️ 인터넷 언어 예절 챗봇 (Vercel 배포판)

바름이·준호·서연·민우·다솜이가 **OpenAI (GPT-4o-mini)** 또는 **Google Gemini AI**로 매번 새로운 대화를 나눕니다.
- **보안**: API 키는 Vercel 서버 환경변수(`OPENAI_API_KEY` 또는 `GEMINI_API_KEY`)에만 저장되어 학생 기기에는 노출되지 않습니다.
- **안정성**: AI 키가 없거나 일시적 오류 발생 시 자동으로 기본(오프라인) 대화 모드로 매끄럽게 작동합니다. (퀴즈방은 항상 기본 모드)

## 환경변수 (API 키) 설정
Vercel 대시보드 또는 터미널에서 아래 환경변수를 등록합니다:
- **`OPENAI_API_KEY`** (추천): OpenAI API 키 (`sk-...`)
  - 기본 모델: `gpt-4o-mini` (응답 속도가 빠르고 1차시 75명 수업 시 비용 수십~수백 원 수준)
  - 원하는 경우 `OPENAI_MODEL` 환경변수로 모델 변경 가능
- **`GEMINI_API_KEY`** (대안): Google Gemini API 키
  - Google AI Studio(aistudio.google.com)에서 발급

## 배포 및 업데이트
이 저장소는 GitHub 및 Vercel과 연동되어 있습니다:
- GitHub 저장소: https://github.com/gambasslab/Chatbot_korean
- 배포 사이트: https://dist-chatbot-zeta.vercel.app
- 코드를 수정 후 `git push origin main`하면 Vercel에서 자동으로 최신 버전이 재배포됩니다.

