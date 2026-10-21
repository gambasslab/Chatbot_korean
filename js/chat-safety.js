/**
 * 초등학교 4학년 맞춤형 인터넷 언어 예절 분석기 (Chat Safety & Politeness Engine)
 * - 비속어, 줄임말, 비꼬는 표현(어쩔티비 등) 감지
 * - 칭찬, 공감, 배려, 존댓말 가산점 계산 (예절 온도: 36.5℃ ~ 100℃)
 * - 거친 말을 부드럽고 예의 바른 말로 변환해주는 '바른 말 마법사'
 */

const NetiquetteSafety = (() => {
  // 1. 공격적이거나 부적절한 언어 목록 (초등학생들이 흔히 접하는 비속어, 자음 욕설, 신조어 비하어)
  const toxicPatterns = [
    { regex: /닥쳐|아가리|시끄러|입닥|닥치/i, label: '상대방의 말을 막는 거친 말', advice: '친구의 말도 끝까지 들어주는 배려가 필요해요.' },
    { regex: /꺼져|ㄲㅈ|사라져|저리가/i, label: '친구를 배척하는 말', advice: '마음에 들지 않더라도 차분하게 의사를 표현해 봐요.' },
    { regex: /개못|못하네|똥손|발컨|발로하/i, label: '능력을 비하하고 무시하는 말', advice: '누구나 실수할 수 있어요. 격려의 말을 건네보세요.' },
    { regex: /노답|뇌절|노양심|극혐|쌉소리|개소리/i, label: '비난하고 조롱하는 신조어', advice: '신조어 대신 기분을 부드럽게 설명해 보세요.' },
    { regex: /어쩔티비|어쩔|저쩔|안물|안궁/i, label: '대화를 회피하고 비꼬는 말', advice: '친구의 말에 진지하게 귀 기울여 주면 서로 기분이 좋아져요.' },
    { regex: /바보|멍청|등신|병신|ㅂㅅ|새끼|ㅅㄲ|씨발|시발|ㅅㅂ|존나|존버|ㅈㄴ|지랄|ㅈㄹ/i, label: '욕설 및 비속어', advice: '욕설은 듣는 친구의 마음에 깊은 상처를 남겨요.' },
    { regex: /망함|망했다|너땜에|너때문/i, label: '남의 탓으로 돌리는 말', advice: '문제를 해결하기 위해 우리가 함께 도울 방법을 찾아봐요.' },
    { regex: /ㅉㅉ|쯧쯧|ㅋㅋㅋ[ㅋ]*\s*(못|병|에휴)/i, label: '비웃는 표현', advice: '비웃기보다는 따뜻한 응원을 보내주세요.' }
  ];

  // 2. 바른 말, 칭찬, 공감, 예의 바른 표현 패턴 (가점 요인)
  const positivePatterns = [
    { regex: /고마워|감사합|덕분이야|고맙습니다|고마웠/i, score: 8, tag: '감사' },
    { regex: /미안해|죄송|내가잘못|사과할게|미안/i, score: 7, tag: '사과/반성' },
    { regex: /괜찮아|그럴수있지|힘내|토닥토닥|응원해|파이팅|화이팅/i, score: 9, tag: '위로/격려' },
    { regex: /도와줄까|도와줄게|같이하자|함께하자|내가할게/i, score: 10, tag: '협동/배려' },
    { regex: /멋져|대단해|잘했어|최고야|좋은생각|축하해/i, score: 8, tag: '칭찬/인정' },
    { regex: /어떤일있어\?|무슨일있니\?|기분어때\?|속상했겠다/i, score: 10, tag: '공감/경청' },
    { regex: /요\b|습니다|십니까|부탁해|해볼래\?/i, score: 5, tag: '존중/청유' }
  ];

  // 3. 바른 말 변환 추천 사전 (거친 말 -> 착하고 고운 말 치환 맵)
  const politeRewrites = [
    {
      check: (txt) => /어쩔티비|저쩔티비|안물|안궁/.test(txt),
      suggestions: [
        '“그럴 수도 있겠구나. 네 생각도 듣고 싶어.”',
        '“그렇구나! 우리 서로 기분 좋게 대화하자.”'
      ]
    },
    {
      check: (txt) => /개못|못하네|발컨|똥손/.test(txt),
      suggestions: [
        '“처음엔 누구나 서툴 수 있어! 다음 판엔 더 잘될 거야.”',
        '“내가 알고 있는 팁을 조금 알려줄까?”'
      ]
    },
    {
      check: (txt) => /너\s*(땜|때문)에\s*망/.test(txt),
      suggestions: [
        '“아쉽지만 괜찮아, 다음번에 같이 더 잘해보자!”',
        '“실수해도 괜찮아. 우리 모둠이 힘을 합치면 돼.”'
      ]
    },
    {
      check: (txt) => /닥쳐|시끄러|아가리/.test(txt),
      suggestions: [
        '“잠깐만 내 말도 차분히 들어주겠니?”',
        '“서로 번갈아 가며 한 사람씩 이야기해보자.”'
      ]
    },
    {
      check: (txt) => /노답|극혐|뇌절/.test(txt),
      suggestions: [
        '“이 문제는 조금 어려운데, 함께 해결책을 찾아볼까?”',
        '“다른 방법으로 한번 시도해보면 어떨까?”'
      ]
    },
    {
      check: (txt) => /왜\s*안해|빨리해|ㅡㅡ/.test(txt),
      suggestions: [
        '“혹시 어려운 부분이 있니? 내가 도와줄까?”',
        '“시간이 부족하면 우리가 역할을 조금 나누어보자.”'
      ]
    },
    {
      check: (txt) => /꺼져|사라져|저리가/.test(txt),
      suggestions: [
        '“지금은 마음을 가라앉히고 조금 이따가 다시 이야기하자.”',
        '“우리 모두 즐겁게 어울릴 수 있는 방법을 찾아보자.”'
      ]
    }
  ];

  /**
   * 입력된 텍스트의 언어 예절 분석
   * @param {string} text - 학생의 메시지
   * @returns {object} - 분석 결과 { isToxic, toxicMatches, positiveMatches, deltaTemp, suggestions, tags }
   */
  function analyze(text) {
    if (!text || !text.trim()) {
      return { isToxic: false, toxicMatches: [], positiveMatches: [], deltaTemp: 0, suggestions: [], tags: [] };
    }

    const trimmed = text.trim();
    const toxicMatches = [];
    const positiveMatches = [];
    const tags = [];

    // 1) 부정/비속어 검사
    for (const item of toxicPatterns) {
      if (item.regex.test(trimmed)) {
        toxicMatches.push({ label: item.label, advice: item.advice });
      }
    }

    // 2) 긍정/고운 말 검사
    for (const item of positivePatterns) {
      if (item.regex.test(trimmed)) {
        positiveMatches.push({ tag: item.tag, score: item.score });
        tags.push(item.tag);
      }
    }

    // 3) 온도 변화(deltaTemp) 계산
    let delta = 0;
    if (toxicMatches.length > 0) {
      delta -= toxicMatches.length * 7;
    }

    if (positiveMatches.length > 0) {
      const positiveScore = positiveMatches.reduce((acc, cur) => acc + cur.score, 0);
      delta += Math.min(22, positiveScore);
    } else if (toxicMatches.length === 0) {
      if (trimmed.length >= 3) {
        delta += 2;
      }
    }

    // 4) 착한 말 변환 추천 생성
    const suggestions = [];
    for (const rule of politeRewrites) {
      if (rule.check(trimmed)) {
        suggestions.push(...rule.suggestions);
      }
    }

    if (toxicMatches.length > 0 && suggestions.length === 0) {
      suggestions.push('“내 생각은 조금 달라, 이렇게 해보면 어떨까?”');
      suggestions.push('“속상한 마음은 이해하지만, 우리 예쁜 말을 써보자!”');
    }

    return {
      isToxic: toxicMatches.length > 0,
      toxicMatches,
      positiveMatches,
      deltaTemp: delta,
      suggestions: [...new Set(suggestions)],
      tags: [...new Set(tags)]
    };
  }

  return {
    analyze,
    toxicPatterns,
    positivePatterns
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetiquetteSafety;
}
