/**
 * 초등학교 4학년 국어 언어 예절 교육 챗봇 시나리오 엔진 (Chat Scenarios)
 * 5개의 특화된 채팅방:
 * 1. bareum: 바름이의 예절 상담소 (자유 대화 & AI 코칭)
 * 2. group_project: 모둠 과제 단톡방 (갈등 중재 & 협동)
 * 3. game_room: 게임 단톡방 사건 (스포츠맨십 & 언어 순화)
 * 4. comfort_room: 토닥토닥 위로방 (공감과 칭찬)
 * 5. quiz_room: 훈민정음 예절 퀴즈방 (상식 퀴즈 & 재미)
 */

const NetiquetteScenarios = (() => {
  // 채팅방 메타데이터
  const rooms = {
    bareum: {
      id: 'bareum',
      name: '바름이의 예절 상담소',
      avatar: '🐿️',
      role: '언어 예절 멘토 요정',
      badge: '예절 멘토',
      description: '인터넷 언어 예절에 대해 무엇이든 물어보세요!',
      members: 2
    },
    group_project: {
      id: 'group_project',
      name: '[모둠 2] 국어 발표 준비방',
      avatar: '📚',
      role: '준호, 서연, 나',
      badge: '협동 지킴이',
      description: '과제가 늦어진 친구를 비난하지 않고 돕는 대화 미션',
      members: 3
    },
    game_room: {
      id: 'game_room',
      name: '방과후 로블록스 게임방',
      avatar: '🎮',
      role: '민우, 나',
      badge: '페어플레이 왕',
      description: '게임에서 져서 험한 말을 쓰는 친구를 진정시키는 미션',
      members: 2
    },
    comfort_room: {
      id: 'comfort_room',
      name: '속닥속닥 비밀친구 다솜이',
      avatar: '🌸',
      role: '다솜, 나',
      badge: '따뜻한 공감천사',
      description: '시험 점수 때문에 속상한 친구에게 힘이 되는 위로 건네기',
      members: 2
    },
    quiz_room: {
      id: 'quiz_room',
      name: '도전! 훈민정음 퀴즈 배틀',
      avatar: '🦉',
      role: '퀴즈 박사 훈이',
      badge: '우리말 퀴즈왕',
      description: '인터넷 예절과 신조어 바로잡기 5문 5답 퀴즈',
      members: 2
    }
  };

  // 같은 답이 연속으로 나오지 않도록 무작위 선택
  const lastPicked = {};
  function pick(key, arr) {
    if (!Array.isArray(arr)) return arr;
    if (arr.length === 1) return arr[0];
    let i;
    do { i = Math.floor(Math.random() * arr.length); } while (i === lastPicked[key]);
    lastPicked[key] = i;
    return arr[i];
  }

  // 1. 바름이 질의응답 지식 베이스 (자연어 패턴 매칭)
  const bareumFAQ = [
    {
      keywords: [/안녕/, /반가워/, /하이/, /누구/],
      response: ['안녕! 만나서 정말 반가워! 🌟 나는 네가 인터넷 세상에서 친구들과 기분 좋고 예쁜 말로 소통할 수 있도록 돕는 예절 요정 **바름이**야. 오늘 기분은 어때?', '반가워! 👋 나는 다람쥐 요정 **바름이**야. 오늘은 인터넷에서 친구랑 기분 좋게 대화하는 법을 같이 연습해 볼까? 요즘 단톡방에서 어떤 말을 자주 쓰는지 궁금해!']
    },
    {
      keywords: [/욕/, /비속어/, /왜.*안.*돼/, /왜.*쓰면/],
      response: ['우리가 눈을 마주치지 않는 온라인 공간에서 욕을 쓰면, 화면 뒤에 있는 친구는 마음에 깊은 멍이 들게 돼. 😢 칼로 베인 상처보다 말로 베인 상처가 더 오래 남는다는 속담도 있잖아? 바르고 고운 말을 쓰면 친구도 나를 존중해주고 진짜 멋진 사람이 된단다!', '욕은 장난으로 해도 듣는 친구는 진짜로 상처받을 수 있어. 😢 글자는 표정이 안 보여서 더 세게 느껴지거든. 화가 날 땐 “나 지금 좀 속상해”처럼 내 기분을 말로 설명해 보는 건 어때?']
    },
    {
      keywords: [/단톡/, /단톡방/, /규칙/, /예절/],
      response: ['초등학생 단톡방 3대 황금 규칙을 알려줄게! 📝\n1️⃣ 늦은 밤(저녁 9시 이후)에는 톡 보내지 않기!\n2️⃣ 친구를 왕따시키거나 허락 없이 다른 방에 강제로 초대하지 않기!\n3️⃣ 상대방이 답장이 늦어도 다그치지 말고 배려하기!', '단톡방에서 꼭 기억할 것! 📌 ① 한 친구만 빼고 이야기하지 않기 ② 친구 사진·이름은 허락받고 올리기 ③ 화날 땐 바로 보내지 말고 한 번 더 읽어 보기! 너는 어떤 규칙이 제일 중요하다고 생각해?']
    },
    {
      keywords: [/어쩔티비/, /킹받네/, /신조어/, /줄임말/],
      response: ['신조어나 줄임말은 가끔 재미있을 수 있지만, 대화를 끊거나 친구를 약올리는 데 쓰면 상대방은 무시당하는 기분을 느껴. “어쩔티비” 대신 “그렇구나, 네 생각도 궁금해!”처럼 부드럽게 바꿔 말해보면 어떨까? ✨', '“킹받네”, “어쩔티비” 같은 말은 친구 사이에 장난처럼 쓰지만, 진지하게 말한 친구는 무시당한 느낌이 들 수 있어. 🤔 “아, 그건 좀 속상하다”처럼 진짜 기분을 말해 주면 훨씬 잘 통해!']
    },
    {
      keywords: [/온도/, /몇.*도/, /체온/],
      response: ['화면 위쪽에 있는 **예절 온도계**가 보이니? 친구를 배려하고 따뜻한 칭찬과 공감의 말을 많이 건넬수록 온도가 쑥쑥 올라가서 100℃가 되면 멋진 **왕관 배지**를 받을 수 있어! 👑', '예절 온도계는 네 말의 따뜻함을 재는 온도계야! 🌡️ 고마워, 괜찮아, 도와줄까 같은 말을 쓰면 올라가고, 거친 말을 쓰면 내려가. 100℃까지 도전해 볼래?']
    },
    {
      keywords: [/칭찬/, /고마워/, /사랑해/, /예쁘다/, /멋져/],
      response: ['와! 그렇게 따뜻한 말을 들으니 내 마음도 퐁퐁 솟아나듯 행복해져! 💖 따뜻한 말 한마디는 전염병처럼 주변 사람들을 미소 짓게 만드는 마법이야!', '헤헤, 고마워! 😊 이렇게 예쁜 말을 들으면 하루 종일 기분이 좋아져. 오늘 이 말을 반 친구 한 명한테도 꼭 보내 줘!']
    },
    {
      keywords: [/친구가.*욕/, /신고/, /싸웠/],
      response: ['친구가 단톡방에서 나쁜 말을 해서 속상했구나. 🥺 그럴 땐 똑같이 욕으로 맞대응하지 말고, “그런 말 들으니 내 기분이 너무 나빠. 그만해 줬으면 좋겠어”라고 당당하게 말해봐. 그래도 멈추지 않으면 화면을 캡처해서 선생님이나 부모님께 꼭 도움을 요청해야 해!', '많이 속상했겠다. 🥺 그 친구한테 똑같이 되갚기보다는 “그 말은 나한테 상처야”라고 분명하게 말해 줘. 계속되면 혼자 참지 말고 화면을 저장해서 선생님이나 부모님께 꼭 알려야 해!']
    }
  ];

  // 2. 퀴즈방 문제 데이터
  const quizQuestions = [
    {
      question: 'Q1. 단톡방에서 친구가 늦게 답장한다고 "아 개답답하네 ㅡㅡ 너 차단함"이라고 글을 올렸어요. 이것은 사이버 언어폭력에 해당할까요?',
      options: ['O (맞다, 언어폭력이다)', 'X (아니다, 답답해서 그럴 수 있다)'],
      answerIndex: 0,
      explanation: '정답입니다! 온라인에서 공개적으로 친구를 비난하거나 배척하는 말은 마음을 다치게 하는 사이버 언어폭력이에요.'
    },
    {
      question: 'Q2. 친구의 의견을 무시하고 비꼬는 신조어 "어쩔티비" 대신 쓸 수 있는 가장 예의 바른 말은 무엇일까요?',
      options: ['1) 안물안궁', '2) 네 생각은 그렇구나, 내 생각은 조금 달라', '3) 킹받네 그만해'],
      answerIndex: 1,
      explanation: '정답! 친구의 생각을 먼저 인정해준 뒤 내 의견을 부드럽게 표현하는 것이 올바른 대화 예절입니다.'
    },
    {
      question: 'Q3. 온라인 대화에서는 내 표정과 목소리가 보이지 않아요. 친구에게 오해를 사지 않고 따뜻한 마음을 전하는 방법은?',
      options: ['1) 줄임말과 느낌표를 10개씩 쓴다', '2) 바르고 고운 말과 적절한 이모티콘을 사용한다', '3) 친하니까 무조건 거친 반말을 쓴다'],
      answerIndex: 1,
      explanation: '정답입니다! 텍스트 대화에서는 표정이 보이지 않으므로 따뜻한 어조와 다정한 이모티콘이 큰 도움이 됩니다.'
    },
    {
      question: 'Q4. 친구가 모둠 과제를 깜빡해서 늦었을 때, "너 땜에 망했잖아" 대신 사용할 수 있는 \'나-전달법\'은?',
      options: ['1) 넌 진짜 구제불능이야', '2) 네가 늦어서 과제가 늦어질까 봐 걱정됐어. 내가 도와줄까?', '3) 쌤한테 다 이를 거야'],
      answerIndex: 1,
      explanation: '멋져요! 상대를 탓하는 대신 내 솔직한 감정(걱정)을 전달하고 도움을 제안하는 것이 최고의 소통법이에요.'
    },
    {
      question: 'Q5. 친구가 단톡방에 올린 재미있는 엽기 사진을 허락 없이 다른 친구들이나 SNS에 퍼뜨리는 것은 괜찮을까요?',
      options: ['1) 재미있으니까 괜찮다', '2) 친구의 초상권을 침해하고 수치심을 주는 잘못된 행동이다'],
      answerIndex: 1,
      explanation: '완벽합니다! 친구의 사진이나 개인정보는 반드시 본인의 허락을 받아야 하며, 허락 없이 퍼뜨리는 것은 심각한 피해를 줍니다.'
    }
  ];

  /**
   * 각 방의 초기 메시지 반환
   */
  function getInitialMessages(roomId) {
    const time = getCurrentTimeStr();
    switch (roomId) {
      case 'bareum':
        return [
          {
            sender: 'bareum',
            name: '바름이 🐿️',
            avatar: '🐿️',
            text: '안녕! 나는 너의 인터넷 언어 예절 멘토 요정 **바름이**야! ✨\n\n국어 시간에 배우는 "예의를 지키며 대화해요"를 나와 함께 카카오톡으로 실천해 볼까?\n궁금한 점이 있거나, 고민이 있다면 편하게 톡 보내줘!',
            time,
            isBot: true
          }
        ];

      case 'group_project':
        return [
          {
            sender: 'junho',
            name: '준호',
            avatar: '👦',
            text: '아 서연이 아직도 자료 안 올렸네 ㅡㅡ 오늘 밤까지 선생님한테 제출해야 하는데 다 망함 진짜.',
            time,
            isBot: true
          },
          {
            sender: 'system',
            text: '💡 [미션] 준호의 불만을 가라앉히고, 서연이에게 상처 주지 않으면서 과제를 해결하는 다정한 말을 건네보세요!',
            time,
            isSystem: true
          }
        ];

      case 'game_room':
        return [
          {
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: '아 개열받네 진짜!! 우리 팀에 완전 발컨 똥손 있어서 랭크 다 깎임 ㅡㅡ 어쩔티비 진짜 노답 ㅉㅉ',
            time,
            isBot: true
          },
          {
            sender: 'system',
            text: '💡 [미션] 게임에서 져서 험한 말을 쏟아내는 민우를 진정시키고, 바른 스포츠맨십을 알려주세요!',
            time,
            isSystem: true
          }
        ];

      case 'comfort_room':
        return [
          {
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: '오늘 국어 단원평가 봤는데 60점 맞았어... 맨날 열심히 공부했는데 나 바보인가봐 ㅠㅠ 엄마한테 혼날 것 같아서 집에 가기 무서워...',
            time,
            isBot: true
          },
          {
            sender: 'system',
            text: '💡 [미션] 기가 죽어 눈물을 흘리는 다솜이에게 진심 어린 위로와 용기를 주는 따뜻한 말을 보내주세요!',
            time,
            isSystem: true
          }
        ];

      case 'quiz_room':
        return [
          {
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: '안녕! 나는 올바른 우리말과 인터넷 예절을 알려주는 **훈이 박사**란다! 🎓\n총 5문제의 예절 퀴즈를 풀어볼 준비가 되었니? 아래 보기 번호를 누르거나 답을 입력해봐!',
            time,
            isBot: true
          },
          {
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: quizQuestions[0].question,
            options: quizQuestions[0].options,
            quizIndex: 0,
            time,
            isBot: true
          }
        ];

      default:
        return [];
    }
  }

  /**
   * 시나리오 진행 상태 관리 객체
   */
  const roomStates = {
    bareum: { step: 0 },
    group_project: { step: 0, completed: false },
    game_room: { step: 0, completed: false },
    comfort_room: { step: 0, completed: false },
    quiz_room: { currentQ: 0, score: 0, completed: false }
  };

  /**
   * 학생의 메시지에 따른 시나리오별 반응 계산
   * @param {string} roomId
   * @param {string} studentText
   * @param {object} analysis - NetiquetteSafety.analyze 결과
   * @returns {Array<object>} - 응답 메시지 목록
   */
  function processMessage(roomId, studentText, analysis) {
    const time = getCurrentTimeStr();
    const responses = [];
    const state = roomStates[roomId];

    switch (roomId) {
      // -------------------------------------------------------------
      // 1. 바름이의 예절 상담소
      // -------------------------------------------------------------
      case 'bareum': {
        if (analysis.isToxic) {
          responses.push({
            sender: 'bareum',
            name: '바름이 🐿️',
            avatar: '🐿️',
            text: `앗! 방금 보낸 말에서 조금 거친 표현이 느껴졌어. 😢\n친구와 이야기할 때는 “${analysis.toxicMatches[0].label}” 대신, 이렇게 바꿔 말해보면 어떨까?\n\n✨ **바름이의 꿀팁 추천**: ${analysis.suggestions[0] || '“우리 서로 기분 좋게 이야기하자!”'}`,
            time,
            isBot: true
          });
          return responses;
        }

        // 키워드 기반 답변 찾기
        let matched = false;
        for (const item of bareumFAQ) {
          if (item.keywords.some(rx => rx.test(studentText))) {
            responses.push({
              sender: 'bareum',
              name: '바름이 🐿️',
              avatar: '🐿️',
              text: pick('faq' + bareumFAQ.indexOf(item), item.response),
              time,
              isBot: true
            });
            matched = true;
            break;
          }
        }

        if (!matched) {
          if (analysis.positiveMatches.length > 0) {
            responses.push({
              sender: 'bareum',
              name: '바름이 🐿️',
              avatar: '🐿️',
              text: pick('bpos', ['우와! 정말 마음이 따뜻해지는 예쁜 표현이야! 🌷 네 덕분에 예절 온도가 쑥쑥 올라갔어! 또 어떤 이야기 해볼까?', '그 말 들으니까 내 꼬리가 살랑살랑 흔들려! 🐿️ 친구들도 이런 말을 들으면 정말 힘이 날 거야.', '멋지다! 👍 그렇게 상대를 생각하는 말이 바로 언어 예절의 핵심이야. 오늘 누구에게 이 말을 해 주고 싶어?']),
              time,
              isBot: true
            });
          } else {
            responses.push({
              sender: 'bareum',
              name: '바름이 🐿️',
              avatar: '🐿️',
              text: pick('bdef', ['네 이야기 잘 들었어! 😊 사이버 공간에서도 눈앞에 친구가 서 있다고 생각하며 말하면 오해가 줄어들어!', '오, 그렇구나! 🤔 혹시 그 이야기를 단톡방에서 친구에게 한다면 어떻게 말할지 한번 써 볼래?', '좋아, 계속 이야기해 줘! 📝 "단톡방 규칙", "신조어", "친구랑 싸웠을 때" 같은 걸 물어봐도 돼.', '음~ 그 말을 듣는 친구 기분은 어떨지 같이 생각해 볼까? 표정이 안 보이는 채팅에서는 말투가 정말 중요하거든! 💬']),
              time,
              isBot: true
            });
          }
        }
        return responses;
      }

      // -------------------------------------------------------------
      // 2. 모둠 과제 단톡방
      // -------------------------------------------------------------
      case 'group_project': {
        if (state.completed) {
          responses.push({
            sender: 'seoyeon',
            name: '서연',
            avatar: '👧',
            text: '우리가 힘을 합치니까 멋지게 과제 끝낼 수 있었어! 정말 고마워 친구들아! 💖',
            time,
            isBot: true
          });
          return responses;
        }

        // 학생이 준호처럼 공격하거나 비난했을 경우
        if (analysis.isToxic || /맞아|노답|서연.*짜증|빨리해|ㅡㅡ/.test(studentText)) {
          responses.push({
            sender: 'seoyeon',
            name: '서연',
            avatar: '👧',
            text: '미안해... 나도 일부러 그런 게 아니라 동생이 다쳐서 병원에 다녀오느라 늦은 건데... 너희까지 그렇게 욕하고 몰아세우니까 너무 속상해... ㅠㅠ (서연님이 단톡방을 나갔습니다)',
            time,
            isBot: true
          });
          responses.push({
            sender: 'system',
            text: '⚠️ [경고] 친구의 사정을 묻지 않고 비난하여 갈등이 커졌습니다. 예절 온도가 내려갔어요. 사과하고 서연이를 초대해 다시 다정하게 말을 건네보세요!',
            time,
            isSystem: true
          });
        } else if (analysis.positiveMatches.length > 0 || /도와|괜찮|무슨일|사정|기다|천천히/.test(studentText)) {
          // 따뜻하게 중재하고 협동을 제안한 경우
          responses.push({
            sender: 'seoyeon',
            name: '서연',
            avatar: '👧',
            text: '흑흑... 물어봐 줘서 고마워 ㅠㅠ 동생이 열이 나서 병원에 다녀오느라 컴퓨터를 못 켰어. 바로 정리해서 10분 안에 단톡에 올릴게! 정말 미안해!',
            time,
            isBot: true
          });

          setTimeout(() => {
            // 이어서 준호의 반성
          }, 1000);

          responses.push({
            sender: 'junho',
            name: '준호',
            avatar: '👦',
            text: '아... 그런 줄도 모르고 나 혼자 화만 냈네. 서연아 미안해! 그리고 친구야, 네가 차분하게 말해줘서 나도 정신 차렸어.',
            time,
            isBot: true
          });

          responses.push({
            sender: 'system',
            text: '🎉 [미션 성공!] 비난 대신 배려와 질문으로 모둠의 위기를 해결했습니다! **[협동 지킴이 배지]**를 획득했어요!',
            time,
            isSystem: true,
            grantBadge: '협동 지킴이'
          });

          state.completed = true;
        } else {
          responses.push({
            sender: 'junho',
            name: '준호',
            avatar: '👦',
            text: pick('gp', ['흠... 어떡하지? 시간은 계속 가는데 답답하다...', '근데 서연이는 왜 아무 말도 없는 거야? 무슨 일 있나...', '그래서 어떻게 하자는 건데? 오늘 밤까지 내야 한다고!', '(서연) ...']),
            time,
            isBot: true
          });
        }
        return responses;
      }

      // -------------------------------------------------------------
      // 3. 게임 단톡방 사건
      // -------------------------------------------------------------
      case 'game_room': {
        if (state.completed) {
          responses.push({
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: '이제 화 다 풀렸어! 우리 매너 지키면서 즐겁게 다시 게임하자! 🎮',
            time,
            isBot: true
          });
          return responses;
        }

        if (analysis.isToxic || /닥쳐|너도|개못|발컨|어쩌라고/.test(studentText)) {
          responses.push({
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: '뭐라고? 너까지 나한테 시비냐? 진짜 다 차단하고 친구 끊는다 ㅡㅡ',
            time,
            isBot: true
          });
          responses.push({
            sender: 'system',
            text: '⚠️ [경고] 화가 난 친구에게 맞받아쳐 감정이 더 폭발했습니다! 화를 식힐 수 있는 부드러운 말로 바꿔보세요.',
            time,
            isSystem: true
          });
        } else if (/진정|괜찮|게임일뿐|다음에|실수|그럴수|같이하자|힘내/.test(studentText) || analysis.positiveMatches.length > 0) {
          responses.push({
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: '후... 후... 네 말 들으니 내가 너무 흥분했네. 😮‍💨 게임에 너무 몰입하다 보니 나도 모르게 거친 말이 튀어나왔어. 팀원들도 실수하고 싶어서 한 게 아닐 텐데...',
            time,
            isBot: true
          });

          responses.push({
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: '네 덕분에 머리가 맑아졌어! 게임 매너가 진짜 실력이라는 걸 배웠어. 다음 판엔 서로 칭찬하면서 같이 하자! 고마워!',
            time,
            isBot: true
          });

          responses.push({
            sender: 'system',
            text: '🎉 [미션 성공!] 화난 친구의 마음을 진정시키고 스포츠맨십을 실천했습니다! **[페어플레이 왕 배지]**를 획득했어요!',
            time,
            isSystem: true,
            grantBadge: '페어플레이 왕'
          });

          state.completed = true;
        } else {
          responses.push({
            sender: 'minwoo',
            name: '민우',
            avatar: '🧢',
            text: pick('gr', ['아 진짜 오늘따라 게임 안 풀리네... 너무 억울해!', '나만 열심히 한 것 같아서 화나...', '그래도 랭크 떨어진 건 진짜 속상하단 말이야 ㅠ', '...너라면 이럴 때 어떻게 할 건데?']),
            time,
            isBot: true
          });
        }
        return responses;
      }

      // -------------------------------------------------------------
      // 4. 토닥토닥 위로방
      // -------------------------------------------------------------
      case 'comfort_room': {
        if (state.completed) {
          responses.push({
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: '네 따뜻한 위로 덕분에 용기 내서 엄마한테 말씀드렸는데, 다음엔 더 힘내자고 안아주셨어! 진짜 고마워! 🌸',
            time,
            isBot: true
          });
          return responses;
        }

        if (analysis.isToxic || /바보|ㅋㅋㅋ|60점|못했네|혼나야/.test(studentText)) {
          responses.push({
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: '너한테 위로받고 싶어서 털어놓은 건데... 너마저 날 놀리니까 더 눈물이 나... ㅠㅠ',
            time,
            isBot: true
          });
          responses.push({
            sender: 'system',
            text: '⚠️ [주의] 슬픈 친구의 마음을 헤아리지 못했습니다. 친구의 마음에 공감하고 따뜻한 위로를 건네주세요.',
            time,
            isSystem: true
          });
        } else if (analysis.positiveMatches.length > 0 || /괜찮|잘할수|실수|다음|힘내|토닥|속상|열심히|멋져/.test(studentText)) {
          responses.push({
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: '와... 네가 그렇게 말해주니까 눈물이 쏙 들어갔어. 😭\n맞아, 이번 한 번 실수했다고 내가 바보가 되는 건 아니지! 네 말처럼 다음번에 오답노트 열심히 정리해서 다시 잘 보면 될 것 같아.',
            time,
            isBot: true
          });

          responses.push({
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: '나를 진심으로 응원해줘서 정말 고마워. 너는 세상에서 제일 따뜻한 내 최고의 친구야! 💕',
            time,
            isBot: true
          });

          responses.push({
            sender: 'system',
            text: '🎉 [미션 성공!] 좌절한 친구에게 세상에서 가장 따뜻한 공감을 전했습니다! **[따뜻한 공감천사 배지]**를 획득했어요!',
            time,
            isSystem: true,
            grantBadge: '따뜻한 공감천사'
          });

          state.completed = true;
        } else {
          responses.push({
            sender: 'dasom',
            name: '다솜이',
            avatar: '👧',
            text: pick('cr', ['나 진짜 어떻게 해야 할지 모르겠어... 흑흑...', '엄마가 실망하실 것 같아서 너무 무서워...', '나도 열심히 했단 말이야... 근데 왜 이렇게 됐을까', '...내 얘기 들어줘서 고마워. 근데 아직도 마음이 무거워 ㅠㅠ']),
            time,
            isBot: true
          });
        }
        return responses;
      }

      // -------------------------------------------------------------
      // 5. 훈민정음 예절 퀴즈방
      // -------------------------------------------------------------
      case 'quiz_room': {
        if (state.completed) {
          responses.push({
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: `이미 5문제를 모두 멋지게 풀었단다! (총 ${state.score}점 획득) 다른 친구들에게도 퀴즈를 내어보렴!`,
            time,
            isBot: true
          });
          return responses;
        }

        const currentQ = quizQuestions[state.currentQ];
        let isCorrect = false;

        // 답안 확인 (인덱스나 키워드)
        const txt = studentText.toLowerCase().trim();
        if (state.currentQ === 0) { // Q1: O/X
          isCorrect = /o|맞다|언어폭력|1/.test(txt);
        } else if (state.currentQ === 1) { // Q2: 2번
          isCorrect = /2|네 생각|인정/.test(txt);
        } else if (state.currentQ === 2) { // Q3: 2번
          isCorrect = /2|고운 말|이모티콘/.test(txt);
        } else if (state.currentQ === 3) { // Q4: 2번
          isCorrect = /2|걱정|도와줄까/.test(txt);
        } else if (state.currentQ === 4) { // Q5: 2번
          isCorrect = /2|초상권|잘못/.test(txt);
        }

        if (isCorrect) {
          state.score += 20;
          responses.push({
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: `🎯 **딩동댕! 정답입니다!** (+20점)\n\n${currentQ.explanation}`,
            time,
            isBot: true
          });
        } else {
          responses.push({
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: `아쉽지만 오답이에요! 😅\n\n💡 정답 해설: ${currentQ.explanation}`,
            time,
            isBot: true
          });
        }

        state.currentQ++;

        // 다음 문제 출제 또는 퀴즈 종료
        if (state.currentQ < quizQuestions.length) {
          const nextQ = quizQuestions[state.currentQ];
          responses.push({
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: nextQ.question,
            options: nextQ.options,
            quizIndex: state.currentQ,
            time,
            isBot: true
          });
        } else {
          state.completed = true;
          responses.push({
            sender: 'doctor_hoon',
            name: '퀴즈 박사 훈이 🦉',
            avatar: '🦉',
            text: `🏆 **모든 퀴즈를 마쳤습니다!**\n네 최종 점수는 **${state.score}점 / 100점**이야!\n올바른 인터넷 예절 지식을 멋지게 익혔구나! 참 잘했어! 👏`,
            time,
            isBot: true
          });
          responses.push({
            sender: 'system',
            text: '🎉 [퀴즈 완료!] 5문제를 모두 풀고 인터넷 예절 상식을 마스터했습니다! **[우리말 퀴즈왕 배지]**를 획득했어요!',
            time,
            isSystem: true,
            grantBadge: '우리말 퀴즈왕'
          });
        }

        return responses;
      }

      default:
        return responses;
    }
  }

  function getCurrentTimeStr() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${minutes}`;
  }

  return {
    rooms,
    quizQuestions,
    getInitialMessages,
    processMessage,
    roomStates,
    getCurrentTimeStr
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetiquetteScenarios;
}
