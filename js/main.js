/* ================================
   여기 값들만 바꾸면 전체 페이지에 반영됩니다.
   ================================ */
const CONFIG = {
  groom: 'BK',
  bride: 'EH',
  // JS Date 형식: new Date(년, 월-1, 일, 시, 분)
  weddingDate: new Date(2026, 10, 14, 13, 0), // 2026-11-14 13:00 (예시, 실제 날짜로 교체하세요)
  venueName: '00웨딩홀 0층 0홀',
  venueAddress: '서울특별시 00구 00로 00',
};

document.addEventListener('DOMContentLoaded', () => {
  renderTexts();
  renderCalendar();
  renderDday();
  initAccordion();
  initCopyButtons();
  initShare();
});

function renderTexts() {
  const d = CONFIG.weddingDate;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[d.getDay()];
  const hour24 = d.getHours();
  const ampm = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const coverDateText = document.getElementById('coverDateText');
  if (coverDateText) {
    coverDateText.textContent = `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}. ${dayName === '토' ? 'SAT' : dayName === '일' ? 'SUN' : dayName} ${ampm === '오전' ? 'AM' : 'PM'} ${pad(hour12)}:${pad(d.getMinutes())}`;
  }

  const coverVenueText = document.getElementById('coverVenueText');
  if (coverVenueText) coverVenueText.textContent = CONFIG.venueName;

  const calendarDateText = document.getElementById('calendarDateText');
  if (calendarDateText) {
    calendarDateText.textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayName}요일 ${ampm} ${hour12}시${d.getMinutes() ? ' ' + d.getMinutes() + '분' : ''}`;
  }

  const venueNameText = document.getElementById('venueNameText');
  if (venueNameText) venueNameText.textContent = CONFIG.venueName;

  const venueAddress = document.getElementById('venueAddress');
  if (venueAddress) venueAddress.textContent = CONFIG.venueAddress;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function renderCalendar() {
  const el = document.getElementById('calendar');
  if (!el) return;

  const d = CONFIG.weddingDate;
  const year = d.getFullYear();
  const month = d.getMonth();
  const targetDate = d.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let html = '<table><thead><tr>';
  ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
    html += `<th>${day}</th>`;
  });
  html += '</tr></thead><tbody><tr>';

  for (let i = 0; i < firstDay; i++) html += '<td></td>';

  let col = firstDay;
  for (let date = 1; date <= lastDate; date++) {
    if (col === 7) {
      html += '</tr><tr>';
      col = 0;
    }
    if (date === targetDate) {
      html += `<td class="highlight"><span>${date}</span></td>`;
    } else {
      html += `<td>${date}</td>`;
    }
    col++;
  }
  html += '</tr></tbody></table>';

  el.innerHTML = html;
}

function renderDday() {
  const el = document.getElementById('dday');
  if (!el) return;

  const today = new Date();
  const target = new Date(CONFIG.weddingDate.getFullYear(), CONFIG.weddingDate.getMonth(), CONFIG.weddingDate.getDate());
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    el.textContent = `${CONFIG.groom} ♥ ${CONFIG.bride}의 결혼식이 D-${diffDays}일 남았습니다`;
  } else if (diffDays === 0) {
    el.textContent = `오늘은 ${CONFIG.groom} ♥ ${CONFIG.bride}의 결혼식 날입니다`;
  } else {
    el.textContent = `${CONFIG.groom} ♥ ${CONFIG.bride}는 부부가 되었습니다`;
  }
}

function initAccordion() {
  document.querySelectorAll('.accordion-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement.classList.toggle('open');
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      copyText(targetEl.textContent.trim());
    });
  });
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast('복사되었습니다'));
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('복사되었습니다');
    } catch (e) {
      showToast('복사에 실패했습니다');
    }
    document.body.removeChild(textarea);
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function initShare() {
  const linkBtn = document.getElementById('shareLink');
  if (linkBtn) {
    linkBtn.addEventListener('click', () => {
      copyText(window.location.href);
    });
  }

  const kakaoBtn = document.getElementById('shareKakao');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', () => {
      // 카카오 SDK 연동 전까지는 안내만 표시합니다.
      // 사용 방법: https://developers.kakao.com/docs/latest/ko/message/js-link 참고 후
      // Kakao.Share.sendDefault({ ... }) 형태로 교체하세요.
      showToast('카카오톡 공유 기능은 Kakao SDK 연동이 필요합니다');
    });
  }
}
