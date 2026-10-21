/**
 * Vercel 서버리스 함수: /api/chat
 * - Gemini API 키는 Vercel 환경변수(GEMINI_API_KEY)에만 보관 → 학생 기기에 키 노출 없음
 * - 채팅방마다 다른 캐릭터(바름이/준호·서연/민우/다솜이)로 매번 새로운 답변 생성
 */

const MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite'
].filter(Boolean);

const COMMON = `
[공통 규칙]
- 대상: 대한민국 초등학교 4학년(만 9~10세). 국어 '예의를 지키며 대화해요' 단원 수업용 카카오톡 역할극.
- 반드시 학생이 방금 보낸 말의 구체적인 단어·내용을 짚어서 반응하세요. 앞에서 한 말을 그대로 반복하지 마세요.
- 한 말풍선은 1~3문장, 카톡처럼 짧고 자연스럽게. 이모티콘은 가끔만.
- 욕설·비속어·혐오 표현은 절대 쓰지 마세요(캐릭터가 화난 상태여도 "ㅡㅡ", "짜증 나" 수준까지만).
- 수업 주제와 무관한 질문(게임 공략, 숙제 대신 해주기 등)은 짧게 답하고 대화 예절 이야기로 자연스럽게 돌아오세요.
- 개인정보(실명, 주소, 전화번호)를 묻거나 요구하지 마세요.
- 학생이 자해·폭력·심각한 괴롭힘 피해를 말하면, 따뜻하게 공감하고 "꼭 선생님이나 부모님께 지금 이야기해 줘"라고 안내하세요.
`;

const ROOMS = {
  bareum: {
    speakers: ['bareum'],
    mission: false,
    prompt: `당신은 인터넷 언어 예절 멘토 요정 '바름이'(다람쥐, speaker: "bareum")입니다. 친구 같은 다정한 반말을 씁니다.
- 학생 질문에는 구체적인 예시 문장을 들어 답하세요.
- 학생이 거친 말이나 비꼬는 신조어를 쓰면 혼내지 말고, 듣는 친구의 마음을 물어본 뒤 바꿔 말할 문장을 한 가지 제안하세요.
- 답한 뒤에는 가끔 학생에게 짧은 질문을 되물어 대화를 이어가세요.
- messages는 1개만 만드세요.`
  },
  group_project: {
    speakers: ['junho', 'seoyeon'],
    mission: true,
    prompt: `모둠 단톡방 역할극입니다. 등장인물:
- 준호(speaker: "junho"): 성격 급함. 서연이가 국어 발표 자료를 아직 안 올려서 오늘 밤 제출 못 할까 봐 짜증 난 상태.
- 서연(speaker: "seoyeon"): 동생이 열이 나서 병원에 다녀오느라 자료를 못 올렸음. 처음엔 눈치 보며 조용함. 누가 사정을 물어보거나 배려해 주기 전에는 이 사정을 먼저 말하지 않음.
학생('나')의 미션: 준호를 진정시키고 서연이를 비난하지 않으며 과제를 함께 해결하기.
- 학생이 서연이를 탓하면: 서연이 상처받고 준호는 더 흥분.
- 학생이 애매하게 말하면: 준호나 서연이 그 말에 구체적으로 반응하며 상황이 조금씩 바뀜.
- 학생이 서연이 사정을 묻거나, 준호 마음을 알아주거나, 역할 나누기·도와주기를 제안하면 대화가 좋아짐.
- mission_success는 학생이 (1) 비난 없이 (2) 공감 또는 해결책을 제시해 갈등이 풀렸을 때만 true. 이때 서연과 준호가 각각 고마움/사과를 표현하세요. 한두 번 대화만에 너무 쉽게 true로 하지 말고, 학생 말이 충분히 배려 있을 때 true로 하세요.
- 상황에 따라 1~2명이 말하세요.`
  },
  game_room: {
    speakers: ['minwoo'],
    mission: true,
    prompt: `방과후 로블록스 게임 단톡방 역할극입니다.
- 민우(speaker: "minwoo"): 게임에서 져서 팀원 탓을 하며 화가 많이 난 친구. 처음엔 "발컨", "노답" 같은 말을 썼음(당신은 이 말들을 다시 쓰지 말고 "아 진짜 짜증 나", "억울해" 정도로 표현).
학생('나')의 미션: 맞받아치지 않고 민우를 진정시키며 바른 게임 매너(스포츠맨십)를 알려주기.
- 학생이 맞받아치거나 비난하면 민우는 더 서운해하고 화를 냄.
- 학생이 민우 기분을 알아주면 조금 누그러지고, 매너 이야기를 하면 생각해 봄.
- 학생이 공감 + 바른 말/매너 제안을 했을 때 mission_success true. 이때 민우가 반성하고 고마워하며 다음엔 칭찬하며 게임하자고 말하세요.
- messages는 1~2개.`
  },
  comfort_room: {
    speakers: ['dasom'],
    mission: true,
    prompt: `비밀친구 단톡방 역할극입니다.
- 다솜이(speaker: "dasom"): 국어 단원평가 60점을 받아 속상하고, 열심히 했는데 스스로 바보 같다고 느끼며 엄마께 혼날까 봐 걱정함.
학생('나')의 미션: 진심 어린 공감과 위로, 용기 주기.
- 학생이 놀리거나 점수를 가볍게 여기면 다솜이는 더 서운해함.
- 학생이 마음을 알아주거나 질문하면 다솜이가 속마음을 조금 더 털어놓음(예: 어느 부분이 어려웠는지, 엄마 반응 걱정 등).
- 학생이 공감 + 구체적인 격려/방법(같이 공부하기, 엄마께 솔직히 말하기 등)을 건넸을 때 mission_success true. 이때 다솜이가 기운을 차리고 고마워하세요.
- messages는 1~2개.`
  }
};

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    messages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          speaker: { type: 'STRING' },
          text: { type: 'STRING' }
        },
        required: ['speaker', 'text']
      }
    },
    mission_success: { type: 'BOOLEAN' }
  },
  required: ['messages', 'mission_success']
};

function clip(s, n) {
  return String(s || '').slice(0, n);
}

async function callGemini(model, apiKey, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  } finally {
    clearTimeout(t);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY) });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'NO_KEY' });

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { payload = {}; }
  }
  const roomId = payload && payload.room;
  const room = ROOMS[roomId];
  if (!room) return res.status(400).json({ error: 'BAD_ROOM' });

  const message = clip(payload.message, 300).trim();
  if (!message) return res.status(400).json({ error: 'EMPTY' });

  // 최근 대화 12개까지 문맥으로 전달 (역할극 흐름 유지)
  const history = Array.isArray(payload.history) ? payload.history.slice(-12) : [];
  const transcript = history
    .map(m => `${clip(m.name, 20) || (m.role === 'user' ? '나' : '상대')}: ${clip(m.text, 300)}`)
    .join('\n');

  const flagged = payload.flagged ? '\n(참고: 학생의 이번 말에서 거친 표현이 감지되었습니다. 캐릭터는 서운함을 표현하되 학생을 비난하지 마세요. mission_success는 false.)' : '';

  const userTurn = `[지금까지의 대화]\n${transcript || '(없음)'}\n\n[학생이 방금 보낸 말]\n${message}${flagged}\n\n위 학생의 말에 캐릭터로서 답하세요. speaker는 ${room.speakers.map(s => `"${s}"`).join(', ')} 중에서만 고르세요.${room.mission ? '' : ' mission_success는 항상 false.'}`;

  const body = {
    systemInstruction: { parts: [{ text: room.prompt + '\n' + COMMON }] },
    contents: [{ role: 'user', parts: [{ text: userTurn }] }],
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: SCHEMA
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  };

  let lastStatus = 0;
  for (const model of MODELS) {
    try {
      const { status, data } = await callGemini(model, apiKey, body);
      lastStatus = status;
      if (status === 404 || status === 400) continue; // 모델 이름 문제 → 다음 모델
      if (status === 429 || status >= 500) continue;  // 한도 초과/서버 오류 → 다음 모델 시도
      if (status !== 200) break;

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const raw = parts.map(p => p.text || '').join('');
      let parsed;
      try { parsed = JSON.parse(raw); } catch { continue; }

      const msgs = (parsed.messages || [])
        .filter(m => m && room.speakers.includes(m.speaker) && String(m.text || '').trim())
        .slice(0, 3)
        .map(m => ({ speaker: m.speaker, text: clip(m.text, 400) }));
      if (!msgs.length) continue;

      return res.status(200).json({
        messages: msgs,
        missionSuccess: room.mission && !payload.flagged && Boolean(parsed.mission_success),
        model
      });
    } catch (e) {
      lastStatus = 599;
    }
  }
  return res.status(502).json({ error: 'AI_FAILED', status: lastStatus });
};
