/**
 * 초등 4학년 국어 인터넷 언어 예절 챗봇 코어 엔진 (Chat Core)
 * - Web Audio API 실감 카톡 알림음 합성
 * - 메시지 렌더링, 읽음 처리, 타이핑 효과
 * - 예절 온도계(36.5℃ ~ 100℃) 동적 시각화 & 팡파레(Confetti)
 * - 배지 시스템, 미션 트래커, 활동 인증서 출력
 */

const ChatCore = (() => {
  // 접속/새로고침 시 초기화할 localStorage 키 목록
  const STORAGE_KEYS_TO_CLEAR = [
    'netiquette_temp',
    'netiquette_badges',
    'netiquette_quiz_correct_count',
    'netiquette_quiz_score',
    'netiquette_quiz_completed',
    'netiquette_quiz_passed'
  ];

  function clearStoredData() {
    try {
      STORAGE_KEYS_TO_CLEAR.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('localStorage clear failed:', e);
    }
  }

  // 페이지 진입 즉시 이전 저장소 데이터 정리
  clearStoredData();

  // 상태 객체 (localStorage 대신 메모리 변수만 사용하여 새로고침 시 항상 초기값으로 시작)
  const state = {
    studentName: localStorage.getItem('netiquette_student_name') || '4학년 김바름',
    temperature: 36.5,
    soundEnabled: localStorage.getItem('netiquette_sound') !== 'false',
    activeRoomId: 'bareum',
    badges: [],
    missions: {
      praise: false,
      group: false,
      game: false,
      quiz: false,
      temp80: false
    },
    messages: {},
    isTyping: false
  };

  // AI 응답 화자 정보
  const SPEAKERS = {
    bareum: { name: '바름이 🐿️', avatar: '🐿️' },
    junho: { name: '준호', avatar: '👦' },
    seoyeon: { name: '서연', avatar: '👧' },
    minwoo: { name: '민우', avatar: '🧢' },
    dasom: { name: '다솜이', avatar: '👧' }
  };
  const MISSION_SUCCESS = {
    group_project: { badge: '협동 지킴이', text: '🎉 [미션 성공!] 비난 대신 배려와 질문으로 모둠의 위기를 해결했습니다! **[협동 지킴이 배지]**를 획득했어요!' },
    game_room: { badge: '페어플레이 왕', text: '🎉 [미션 성공!] 화난 친구의 마음을 진정시키고 스포츠맨십을 실천했습니다! **[페어플레이 왕 배지]**를 획득했어요!' },
    comfort_room: { badge: '따뜻한 공감천사', text: '🎉 [미션 성공!] 좌절한 친구에게 세상에서 가장 따뜻한 공감을 전했습니다! **[따뜻한 공감천사 배지]**를 획득했어요!' }
  };

  // Web Audio Context 싱글톤
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  /**
   * 카카오톡 특유의 청아한 '카톡' 2단 알림음 합성음 재생
   */
  function playKatalkSound() {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const now = audioCtx.currentTime;
      // 1음: G5 (~784Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // 2음: C6 (~1046Hz) - 약간 시차를 두고 울림
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.08);
      gain2.gain.setValueAtTime(0.22, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  /**
   * 팡파레 축하 효과음
   */
  function playFanfareSound() {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const start = audioCtx.currentTime + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {}
  }

  /**
   * 메시지 전송 효과음 (부드러운 팝소리)
   */
  function playSendSound() {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * 초기화 함수
   */
  function init() {
    // 방별 초기 메시지 설정
    for (const key of Object.keys(NetiquetteScenarios.rooms)) {
      state.messages[key] = NetiquetteScenarios.getInitialMessages(key);
    }

    // 학생 이름 반영
    const nameEl = document.getElementById('student-name-display');
    if (nameEl) nameEl.textContent = state.studentName;

    // 예절 온도 렌더링
    updateTemperature(0);

    // 채팅방 리스트 렌더링
    renderRoomList();

    // 현재 방 메시지 렌더링
    switchRoom(state.activeRoomId);

    // 이벤트 리스너 등록
    setupEventListeners();

    // 사운드 토글 초기 아이콘
    updateSoundBtn();

    // 활동 인증서 버튼 초기 상태 (퀴즈 3문제 이상 여부)
    updateCertBtnState();
  }

  /**
   * 예절 온도 갱신 및 시각화
   */
  function updateTemperature(delta) {
    const oldTemp = state.temperature;
    state.temperature = Math.max(10, Math.min(100, Math.round((state.temperature + delta) * 10) / 10));

    const tempText = document.getElementById('temp-text');
    const tempFill = document.getElementById('temp-gauge-fill');
    const tempEmoji = document.getElementById('temp-emoji');

    if (tempText) tempText.textContent = `${state.temperature.toFixed(1)}℃`;
    if (tempFill) {
      tempFill.style.width = `${Math.min(100, (state.temperature / 100) * 100)}%`;
      if (state.temperature >= 70) {
        tempFill.style.background = 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)';
      } else if (state.temperature >= 40) {
        tempFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)';
      } else {
        tempFill.style.background = 'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)';
      }
    }

    if (tempEmoji) {
      if (state.temperature >= 90) tempEmoji.textContent = '👑';
      else if (state.temperature >= 60) tempEmoji.textContent = '💖';
      else if (state.temperature >= 36) tempEmoji.textContent = '🌱';
      else tempEmoji.textContent = '🥶';
    }

    // 80도 달성 미션 확인
    if (state.temperature >= 80 && !state.missions.temp80) {
      state.missions.temp80 = true;
      grantBadge('온도 80℃ 달성왕');
    }

    // 100도 달성 시 대형 축하
    if (oldTemp < 100 && state.temperature >= 100) {
      grantBadge('예절 마스터 100℃');
      triggerConfetti();
      playFanfareSound();
      showToast('🎉 축하합니다! 예절 온도 100℃ 달성! 최고의 언어 예절 천사예요! 👑');
    }
  }

  /**
   * 배지 부여
   */
  function grantBadge(badgeName) {
    if (!state.badges.includes(badgeName)) {
      state.badges.push(badgeName);
      triggerConfetti();
      playFanfareSound();
      showToast(`🎖️ 새로운 배지 획득! [${badgeName}]`);
      renderBadges();
    }
  }

  /**
   * 배지 모달/드로어 렌더링
   */
  function renderBadges() {
    const list = document.getElementById('badge-list');
    if (!list) return;

    const allBadges = [
      { name: '착한 말 첫걸음', icon: '🌱', desc: '바르고 고운 말을 첫 전송했을 때 수여' },
      { name: '협동 지킴이', icon: '🤝', desc: '모둠 과제에서 친구를 돕고 갈등을 해결' },
      { name: '페어플레이 왕', icon: '🎮', desc: '게임 중 흥분한 친구에게 바른 매너를 전수' },
      { name: '따뜻한 공감천사', icon: '💖', desc: '속상한 친구에게 따뜻한 위로와 용기 선물' },
      { name: '우리말 퀴즈왕', icon: '🦉', desc: '인터넷 예절 5문 5답 퀴즈 마스터' },
      { name: '온도 80℃ 달성왕', icon: '🔥', desc: '예절 온도 80℃를 돌파한 모범 학생' },
      { name: '예절 마스터 100℃', icon: '👑', desc: '예절 온도 100℃ 만점을 달성한 최고의 예절왕' }
    ];

    list.innerHTML = allBadges.map(b => {
      const isOwned = state.badges.includes(b.name);
      return `
        <div class="badge-item ${isOwned ? 'unlocked' : 'locked'}">
          <div class="badge-icon">${isOwned ? b.icon : '🔒'}</div>
          <div class="badge-info">
            <div class="badge-name">${b.name} ${isOwned ? '✨' : ''}</div>
            <div class="badge-desc">${b.desc}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 채팅방 목록 사이드바 렌더링
   */
  function renderRoomList() {
    const container = document.getElementById('room-list');
    if (!container) return;

    container.innerHTML = Object.values(NetiquetteScenarios.rooms).map(r => {
      const activeClass = r.id === state.activeRoomId ? 'active' : '';
      const msgs = state.messages[r.id] || [];
      const lastMsg = msgs[msgs.length - 1];
      const previewText = lastMsg ? (lastMsg.text ? lastMsg.text.replace(/\n/g, ' ') : '사진/이모티콘') : r.description;
      const lastTime = lastMsg ? lastMsg.time : '';

      return `
        <div class="room-item ${activeClass}" data-room-id="${r.id}">
          <div class="room-avatar">${r.avatar}</div>
          <div class="room-content">
            <div class="room-header-row">
              <span class="room-name">${r.name}</span>
              <span class="room-members">${r.members > 2 ? r.members : ''}</span>
              <span class="room-time">${lastTime}</span>
            </div>
            <div class="room-preview">${previewText}</div>
          </div>
        </div>
      `;
    }).join('');

    // 클릭 이벤트
    container.querySelectorAll('.room-item').forEach(el => {
      el.addEventListener('click', () => {
        const roomId = el.getAttribute('data-room-id');
        switchRoom(roomId);
      });
    });
  }

  /**
   * 방 전환
   */
  function switchRoom(roomId) {
    state.activeRoomId = roomId;
    renderRoomList();

    const roomMeta = NetiquetteScenarios.rooms[roomId];
    if (!roomMeta) return;

    // 헤더 타이틀 갱신
    const headerTitle = document.getElementById('chat-room-title');
    const headerMember = document.getElementById('chat-room-members');
    const headerRole = document.getElementById('chat-room-role');

    if (headerTitle) headerTitle.textContent = roomMeta.name;
    if (headerMember) headerMember.textContent = roomMeta.members > 2 ? ` (${roomMeta.members})` : '';
    if (headerRole) headerRole.textContent = roomMeta.role;

    // 메시지 렌더링
    renderMessages();

    // 모바일 뷰인 경우 대화창으로 화면 전환
    document.querySelector('.chat-app-container')?.classList.add('mobile-chat-active');
  }

  /**
   * 메시지 영역 렌더링
   */
  function renderMessages() {
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const msgs = state.messages[state.activeRoomId] || [];

    let html = '';
    msgs.forEach((m, idx) => {
      if (m.isSystem) {
        html += `
          <div class="message-system">
            <span class="system-pill">${m.text}</span>
          </div>
        `;
      } else if (m.sender === 'me') {
        html += `
          <div class="message-row sent">
            <div class="bubble-meta">
              <span class="unread-count">${idx === msgs.length - 1 && state.isTyping ? '1' : ''}</span>
              <span class="message-time">${m.time}</span>
            </div>
            <div class="message-bubble sent">
              ${m.emoticon ? `<div class="bubble-emoticon">${m.emoticon}</div>` : ''}
              ${m.text ? `<div class="bubble-text">${escapeHtml(m.text)}</div>` : ''}
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="message-row received">
            <div class="user-avatar">${m.avatar || '👤'}</div>
            <div class="message-received-body">
              <div class="sender-name">${m.name || '친구'}</div>
              <div class="bubble-and-meta">
                <div class="message-bubble received">
                  ${m.emoticon ? `<div class="bubble-emoticon">${m.emoticon}</div>` : ''}
                  ${m.text ? `<div class="bubble-text">${formatMarkdownSimple(m.text)}</div>` : ''}
                  ${m.options ? renderOptionButtons(m.options, m.quizIndex) : ''}
                </div>
                <div class="bubble-meta">
                  <span class="message-time">${m.time}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });

    if (state.isTyping) {
      const room = NetiquetteScenarios.rooms[state.activeRoomId];
      html += `
        <div class="message-row received typing-row">
          <div class="user-avatar">${room.avatar}</div>
          <div class="message-received-body">
            <div class="sender-name">${room.name}</div>
            <div class="message-bubble received typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      `;
    }

    box.innerHTML = html;
    scrollToBottom();

    // 퀴즈 옵션 버튼 클릭 리스너 연결
    box.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.getAttribute('data-value');
        sendUserMessage(val);
      });
    });
  }

  function renderOptionButtons(options, quizIndex) {
    return `
      <div class="quiz-options-group">
        ${options.map((opt, i) => `
          <button class="quiz-option-btn" data-value="${opt}">
            ${escapeHtml(opt)}
          </button>
        `).join('')}
      </div>
    `;
  }

  function scrollToBottom() {
    const box = document.getElementById('chat-messages');
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }

  function getLocalTimeStr() {
    if (typeof NetiquetteScenarios !== 'undefined' && typeof NetiquetteScenarios.getCurrentTimeStr === 'function') {
      return NetiquetteScenarios.getCurrentTimeStr();
    }
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${minutes}`;
  }

  /**
   * 학생 메시지 전송 처리
   */
  async function sendUserMessage(text, emoticon = null) {
    if ((!text || !text.trim()) && !emoticon) return;

    const trimmedText = (text || '').trim();
    const time = getLocalTimeStr();

    // 1. 언어 예절 분석
    const analysis = NetiquetteSafety.analyze(trimmedText);

    // 2. 메시지 추가
    state.messages[state.activeRoomId].push({
      sender: 'me',
      name: state.studentName,
      text: trimmedText,
      emoticon,
      time,
      analysis
    });

    playSendSound();
    renderMessages();
    renderRoomList();

    // 첫 전송 배지
    grantBadge('착한 말 첫걸음');

    // 3. 온도 변화 적용
    if (analysis.deltaTemp !== 0) {
      updateTemperature(analysis.deltaTemp);
    }

    // 4. 거친 말 사용 시 스마트 추천바 표시
    updateSmartSuggestionBar(analysis);

    // 5. 상대방 응답 시뮬레이션 (타이핑 인디케이터 -> 답장)
    state.isTyping = true;
    renderMessages();

    // 인공지능 or 시나리오 응답 결정
    let botResponses = [];

    const roomId = state.activeRoomId;
    const roomState = NetiquetteScenarios.roomStates[roomId] || {};

    // AI 역할극 응답 (퀴즈방 제외, 미션 완료 전까지)
    if (trimmedText && NetiquetteAI.supportsRoom(roomId) && !roomState.completed) {
      const ai = await NetiquetteAI.generate(roomId, trimmedText, state.messages[roomId].slice(0, -1), analysis.isToxic);
      if (ai) {
        ai.messages.forEach(m => {
          const sp = SPEAKERS[m.speaker] || SPEAKERS.bareum;
          botResponses.push({ sender: m.speaker, name: sp.name, avatar: sp.avatar, text: m.text, time: getLocalTimeStr(), isBot: true });
        });
        if (analysis.isToxic && roomId !== 'bareum') {
          // 거친 말 경고(시스템 메시지)는 기존 규칙 엔진 문구 사용
          NetiquetteScenarios.processMessage(roomId, trimmedText, analysis)
            .filter(r => r.isSystem)
            .forEach(r => botResponses.push(r));
        }
        if (ai.missionSuccess && MISSION_SUCCESS[roomId]) {
          roomState.completed = true;
          botResponses.push({ sender: 'system', text: MISSION_SUCCESS[roomId].text, time: getLocalTimeStr(), isSystem: true, grantBadge: MISSION_SUCCESS[roomId].badge });
        }
      }
    }

    // 기본 시나리오 엔진 응답 (AI 미사용·실패 시)
    if (botResponses.length === 0 && typeof NetiquetteScenarios !== 'undefined') {
      botResponses = NetiquetteScenarios.processMessage(roomId, trimmedText, analysis);
    }

    setTimeout(() => {
      try {
        state.isTyping = false;
        if (botResponses && botResponses.length > 0) {
          botResponses.forEach(r => {
            state.messages[roomId].push(r);
            if (r.grantBadge) {
              grantBadge(r.grantBadge);
            }
            if (r.unlockCert) {
              updateCertBtnState();
              triggerConfetti();
              playFanfareSound();
              showToast('📜 바른 언어생활 실천 인증서가 수여되었습니다!');
            }
            if (r.openCert) {
              prepareCertificate();
              document.getElementById('cert-modal')?.classList.add('active');
            }
          });
        }
        updateCertBtnState();
        playKatalkSound();
        renderMessages();
        renderRoomList();
      } catch (err) {
        console.error('Error rendering bot responses:', err);
      }
    }, 700);
  }

  /**
   * 바른 말 변환 추천 바 업데이트
   */
  function updateSmartSuggestionBar(analysis) {
    const bar = document.getElementById('smart-suggestion-bar');
    if (!bar) return;

    if (analysis && analysis.suggestions && analysis.suggestions.length > 0) {
      bar.innerHTML = `
        <div class="suggestion-header">
          <span class="suggestion-badge">💡 바른 말 마법사</span>
          <span class="suggestion-title">친구의 마음에 상처를 주지 않는 예쁜 표현으로 바꿔볼까요?</span>
        </div>
        <div class="suggestion-chips">
          ${analysis.suggestions.map(s => `
            <button class="chip-btn" data-text="${escapeAttr(s.replace(/^[“"]|[”"]$/g, ''))}">
              ${escapeHtml(s)}
            </button>
          `).join('')}
        </div>
      `;
      bar.style.display = 'block';

      bar.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const newText = e.currentTarget.getAttribute('data-text');
          const input = document.getElementById('chat-input');
          if (input) {
            input.value = newText;
            input.focus();
          }
          bar.style.display = 'none';
        });
      });
    } else {
      bar.style.display = 'none';
    }
  }

  /**
   * 이벤트 리스너 세팅
   */
  function setupEventListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('btn-send');
    const inputForm = document.getElementById('chat-input-form');

    if (inputForm) {
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input) {
          sendUserMessage(input.value);
          input.value = '';
          input.focus();
        }
      });
    }

    // 모바일 뒤로가기 버튼
    const backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        document.querySelector('.chat-app-container')?.classList.remove('mobile-chat-active');
      });
    }

    // 사운드 토글
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem('netiquette_sound', state.soundEnabled);
        updateSoundBtn();
        showToast(state.soundEnabled ? '🔊 카톡 알림음이 켜졌습니다.' : '🔇 알림음이 꺼졌습니다.');
      });
    }

    // 이모티콘 팝업 토글
    const emoticonBtn = document.getElementById('emoticon-picker-btn');
    const emoticonModal = document.getElementById('emoticon-modal');
    if (emoticonBtn && emoticonModal) {
      emoticonBtn.addEventListener('click', () => {
        emoticonModal.classList.toggle('active');
      });

      emoticonModal.querySelectorAll('.emoticon-item').forEach(el => {
        el.addEventListener('click', () => {
          const emo = el.getAttribute('data-emo');
          sendUserMessage('', emo);
          emoticonModal.classList.remove('active');
        });
      });
    }

    // 학생 이름 수정 버튼
    const editNameBtn = document.getElementById('edit-name-btn');
    if (editNameBtn) {
      editNameBtn.addEventListener('click', () => {
        const newName = prompt('국어 시간에 사용할 이름(예: 4학년 1반 홍길동)을 입력하세요:', state.studentName);
        if (newName && newName.trim()) {
          state.studentName = newName.trim();
          localStorage.setItem('netiquette_student_name', state.studentName);
          const nameEl = document.getElementById('student-name-display');
          if (nameEl) nameEl.textContent = state.studentName;
          showToast(`이름이 [${state.studentName}]으로 변경되었습니다.`);
        }
      });
    }

    // 상단 "🔄 처음부터 다시하기" 버튼
    const resetBtn = document.getElementById('reset-all-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetAll(false);
      });
    }

    // 대화창 상단 헤더 리셋 버튼
    const roomRefreshBtn = document.getElementById('room-refresh-btn');
    if (roomRefreshBtn) {
      roomRefreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetAll(false);
      });
    }

    // 배지함 버튼
    const badgeBtn = document.getElementById('badge-drawer-btn');
    const badgeModal = document.getElementById('badge-modal');
    if (badgeBtn && badgeModal) {
      badgeBtn.addEventListener('click', () => {
        renderBadges();
        badgeModal.classList.add('active');
      });
    }

    // 선생님 지도안 모달 버튼
    const teacherBtn = document.getElementById('teacher-guide-btn');
    const teacherModal = document.getElementById('teacher-modal');
    if (teacherBtn && teacherModal) {
      teacherBtn.addEventListener('click', () => {
        teacherModal.classList.add('active');
      });
    }

    // 활동 인증서 모달 & 인쇄 (퀴즈 3문제 이상 맞춰야 발급)
    const certBtn = document.getElementById('cert-print-btn');
    const certModal = document.getElementById('cert-modal');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        const stats = (typeof NetiquetteScenarios !== 'undefined' && NetiquetteScenarios.getQuizStats)
          ? NetiquetteScenarios.getQuizStats()
          : { passed: false, correctCount: 0 };
        if (stats.passed) {
          prepareCertificate();
          certModal?.classList.add('active');
        } else {
          showCertLockedModal(stats);
        }
      });
    }

    // 퀴즈 풀러 가기 버튼 (인증서 잠금 안내 모달)
    const goToQuizBtn = document.getElementById('go-to-quiz-btn');
    if (goToQuizBtn) {
      goToQuizBtn.addEventListener('click', () => {
        document.getElementById('cert-locked-modal')?.classList.remove('active');
        switchRoom('quiz_room');
      });
    }

    // AI 연결 상태 확인 버튼
    const aiBtn = document.getElementById('ai-config-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', async () => {
        const ok = await NetiquetteAI.checkStatus();
        updateAiBtn();
        showToast(ok ? '🤖 AI 친구들이 연결되어 있어요! 자유롭게 대화해 보세요.' : '📴 AI 연결이 안 되어 기본 대화 모드로 작동 중이에요.');
      });
    }
    NetiquetteAI.checkStatus().then(updateAiBtn);

    // 모든 모달 닫기 버튼
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal-backdrop')?.classList.remove('active');
      });
    });

    // 외부 클릭 시 닫기
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  function updateAiBtn() {
    const btn = document.getElementById('ai-config-btn');
    if (btn) btn.textContent = NetiquetteAI.isAvailable() ? '🤖 AI 연결됨' : '📴 기본 모드';
  }

  function updateSoundBtn() {
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.innerHTML = state.soundEnabled ? '🔔' : '🔕';
      btn.title = state.soundEnabled ? '소리 끄기' : '소리 켜기';
    }
  }

  /**
   * 1페이지 활동 인증서 데이터 세팅
   */
  function prepareCertificate() {
    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const certName = document.getElementById('cert-student-name');
    const certDate = document.getElementById('cert-date');
    const certTemp = document.getElementById('cert-temp');
    const certBadges = document.getElementById('cert-badges-grid');
    const certQuiz = document.getElementById('cert-quiz-score');

    if (certName) certName.textContent = state.studentName;
    if (certDate) certDate.textContent = dateStr;
    if (certTemp) certTemp.textContent = `${state.temperature.toFixed(1)}℃`;

    const stats = (typeof NetiquetteScenarios !== 'undefined' && NetiquetteScenarios.getQuizStats)
      ? NetiquetteScenarios.getQuizStats()
      : { correctCount: 0 };
    if (certQuiz) {
      certQuiz.textContent = `5문제 중 ${stats.correctCount}문제 정답 (통과 기준 달성 🌟)`;
    }

    if (certBadges) {
      certBadges.innerHTML = state.badges.length > 0
        ? state.badges.map(b => `<span class="cert-badge-tag">🎖️ ${b}</span>`).join(' ')
        : '<span class="cert-no-badge">미션을 완료하여 배지를 획득해보세요!</span>';
    }
  }

  /**
   * 인증서 잠금(기준 미달) 모달 표시
   */
  function showCertLockedModal(stats) {
    const certLockedModal = document.getElementById('cert-locked-modal');
    const statusText = document.getElementById('cert-lock-status-text');
    const statusSub = document.getElementById('cert-lock-status-sub');

    const count = stats ? (stats.correctCount || 0) : 0;
    if (statusText) {
      statusText.innerHTML = `맞힌 문제: <strong style="color: #e11d48; font-size: 20px;">${count}</strong> / 5문제 (통과 기준: 3문제 이상)`;
    }
    if (statusSub) {
      const remaining = Math.max(0, 3 - count);
      if (count === 0) {
        statusSub.innerHTML = `💡 아직 퀴즈를 풀지 않았거나 정답이 없습니다. 훈이 박사와 함께 3문제 이상 맞혀보세요!`;
      } else {
        statusSub.innerHTML = `💡 앞으로 <strong>${remaining}문제</strong>만 더 맞히면 인증서를 발급받을 수 있어요!`;
      }
    }
    certLockedModal?.classList.add('active');
  }

  /**
   * 상단 인증서 버튼 UI 상태 업데이트 (잠금 / 해제)
   */
  function updateCertBtnState() {
    const certBtn = document.getElementById('cert-print-btn');
    if (!certBtn) return;
    const stats = (typeof NetiquetteScenarios !== 'undefined' && NetiquetteScenarios.getQuizStats)
      ? NetiquetteScenarios.getQuizStats()
      : { passed: false, correctCount: 0 };

    if (stats.passed) {
      certBtn.classList.remove('btn-cert-locked');
      certBtn.classList.add('btn-primary-top', 'btn-cert-unlocked');
      certBtn.innerHTML = '🖨️ 인증서 출력 ✨';
      certBtn.title = `축하합니다! 퀴즈 ${stats.correctCount}문제를 맞춰 인증서가 발급되었습니다. 클릭하여 인쇄하세요.`;
    } else {
      certBtn.classList.remove('btn-primary-top', 'btn-cert-unlocked');
      certBtn.classList.add('btn-cert-locked');
      certBtn.innerHTML = '🔒 인증서 출력';
      certBtn.title = `도전! 훈민정음 퀴즈를 3문제 이상 맞혀야 인증서를 출력할 수 있습니다. (현재: ${stats.correctCount}/5)`;
    }
  }

  /**
   * 폭죽(Confetti) 파티클 애니메이션
   */
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: Math.random() * 6 + 3,
        d: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 3,
        alpha: 1
      });
    }

    let animId;
    let frames = 0;

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frames++;

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.vy;
        p.x += p.vx;
        p.vy += 0.25; // 중력
        p.alpha -= 0.009;

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
        ctx.stroke();
      });

      if (frames < 120) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    }
    render();
  }

  /**
   * 토스트 알림 메시지
   */
  function showToast(msg) {
    let toast = document.getElementById('chat-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'chat-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatMarkdownSimple(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);
    // **볼드**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 줄바꿈
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  /**
   * 전체 데이터 초기화: 예절 온도(36.5℃), 배지, 퀴즈 기록, 대화 내용 모두 초기 상태로 리셋
   */
  function resetAll(skipConfirm = false) {
    if (!skipConfirm) {
      const ok = confirm('🔄 모든 기록을 처음부터 다시 시작할까요?\n\n• 예절 온도: 36.5℃ 초기화\n• 배지 & 퀴즈 기록: 모두 초기화\n• 대화 내용: 초기 상태로 복구');
      if (!ok) return;
    }

    // 1. 관련 localStorage 키 모두 삭제
    clearStoredData();

    // 2. 메모리 상태 완전 초기화
    state.temperature = 36.5;
    state.badges = [];
    state.missions = {
      praise: false,
      group: false,
      game: false,
      quiz: false,
      temp80: false
    };
    state.activeRoomId = 'bareum';
    state.isTyping = false;

    // 3. 시나리오 및 퀴즈 상태 초기화
    if (typeof NetiquetteScenarios !== 'undefined' && typeof NetiquetteScenarios.resetAllScenarios === 'function') {
      NetiquetteScenarios.resetAllScenarios();
    }

    // 4. 대화 내용 초기 메시지로 재설정
    if (typeof NetiquetteScenarios !== 'undefined' && NetiquetteScenarios.rooms) {
      for (const key of Object.keys(NetiquetteScenarios.rooms)) {
        state.messages[key] = NetiquetteScenarios.getInitialMessages(key);
      }
    }

    // 5. UI 동기화
    updateTemperature(0);
    renderBadges();
    renderRoomList();
    switchRoom('bareum');
    updateCertBtnState();

    // 스마트 추천 바 숨기기
    const suggBar = document.getElementById('smart-suggestion-bar');
    if (suggBar) {
      suggBar.classList.remove('active');
      suggBar.innerHTML = '';
    }

    // 입력창 초기화
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = '';
      input.focus();
    }

    showToast('🌱 예절 온도(36.5℃), 배지, 퀴즈, 대화가 모두 처음 상태로 초기화되었습니다!');
  }

  return {
    init,
    sendUserMessage,
    switchRoom,
    updateTemperature,
    grantBadge,
    triggerConfetti,
    showToast,
    updateCertBtnState,
    showCertLockedModal,
    resetAll,
    clearStoredData,
    state
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ChatCore.init();
  });
} else {
  ChatCore.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatCore;
}
