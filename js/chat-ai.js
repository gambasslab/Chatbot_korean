/**
 * AI 연동 모듈
 * - Vercel 서버리스 함수(/api/chat)를 통해 Gemini 호출 (API 키는 서버 환경변수에만 보관)
 * - 실패(키 없음·한도 초과·네트워크 오류) 시 null 반환 → 로컬 시나리오 엔진으로 자동 전환
 */

const NetiquetteAI = (() => {
  const AI_ROOMS = ['bareum', 'group_project', 'game_room', 'comfort_room'];
  let available = null; // null: 미확인, true/false

  function supportsRoom(roomId) {
    return AI_ROOMS.includes(roomId) && available !== false;
  }

  async function checkStatus() {
    try {
      const r = await fetch('/api/chat', { method: 'GET', cache: 'no-store' });
      if (!r.ok) { available = false; return false; }
      const d = await r.json();
      available = Boolean(d.ai);
    } catch (e) {
      available = false;
    }
    return available;
  }

  /**
   * @returns {Promise<{messages: Array<{speaker,text}>, missionSuccess: boolean}|null>}
   */
  async function generate(roomId, text, history, flagged) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: roomId,
          message: text,
          flagged: Boolean(flagged),
          history: (history || [])
            .filter(m => m.text && !m.isSystem)
            .slice(-12)
            .map(m => ({ role: m.sender === 'me' ? 'user' : 'model', name: m.sender === 'me' ? '나' : (m.name || ''), text: m.text }))
        }),
        signal: ctrl.signal
      });
      if (!r.ok) return null;
      const d = await r.json();
      if (!d || !Array.isArray(d.messages) || !d.messages.length) return null;
      return d;
    } catch (e) {
      console.warn('AI 응답 실패 → 기본 시나리오로 전환', e);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return { supportsRoom, checkStatus, generate, isAvailable: () => available === true };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetiquetteAI;
}
