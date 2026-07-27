/* ================================
   여기 값들만 바꾸면 전체 페이지에 반영됩니다.
   ================================ */
const CONFIG = {
  groom: '서배규',
  bride: '양은희',
  // JS Date 형식: new Date(년, 월-1, 일, 시, 분)
  weddingDate: new Date(2027, 0, 16, 13, 20), // 2027-01-16 13:20
  venueName: '신도림 웨딩시티 8층 아모르홀',
  venueAddress: '서울특별시 구로구 새말로 97 신도림테크노마트 8층 웨딩시티',
  // 카카오 개발자센터에서 발급받은 JavaScript 키. 비워두면 지도 대신 안내 문구가 표시됩니다.
  kakaoMapKey: 'ef5c92b80f52634d05d1e5abf4752244',
};

document.addEventListener('DOMContentLoaded', () => {
  renderTexts();
  renderCalendar();
  renderDday();
  initAccordion();
  initCopyButtons();
  initShare();
  initMap();
  initBgm();
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

/* ---------- 배경음악 ---------- */

function initBgm() {
  const audio = document.getElementById('bgm');
  const toggle = document.getElementById('bgmToggle');
  if (!audio || !toggle) return;

  audio.volume = 0.4;
  let stoppedByUser = false;

  const setState = (playing) => {
    toggle.classList.toggle('off', !playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? '배경음악 끄기' : '배경음악 켜기');
  };

  const tryPlay = () =>
    audio
      .play()
      .then(() => true)
      .catch(() => false);

  audio.addEventListener('play', () => setState(true));
  audio.addEventListener('pause', () => setState(false));
  setState(false);

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      stoppedByUser = false;
      tryPlay();
    } else {
      stoppedByUser = true;
      audio.pause();
    }
  });

  // 모바일 브라우저는 소리 있는 자동재생을 막습니다.
  // 막히면 하객이 화면을 처음 건드릴 때 재생을 시작합니다.
  tryPlay().then((started) => {
    if (started) return;

    const events = ['pointerdown', 'touchstart', 'keydown'];
    const onFirstGesture = (event) => {
      // 음악 버튼을 눌러 켜는 경우는 버튼 핸들러가 처리합니다.
      if (event.target.closest && event.target.closest('#bgmToggle')) return;
      if (stoppedByUser) {
        cleanup();
        return;
      }
      tryPlay().then((ok) => {
        if (ok) cleanup();
      });
    };
    const cleanup = () => events.forEach((name) => window.removeEventListener(name, onFirstGesture));

    events.forEach((name) => window.addEventListener(name, onFirstGesture, { passive: true }));
  });
}

/* ---------- 지도 ---------- */

function initMap() {
  const container = document.getElementById('map');
  if (!container) return;

  // 좌표를 모르는 상태에서도 지도 앱 링크는 주소 검색으로 동작합니다.
  setMapLinks(null);

  if (!CONFIG.kakaoMapKey) {
    showMapFallback('지도를 표시하려면 카카오 JavaScript 키가 필요합니다');
    return;
  }

  loadKakaoMapSdk()
    .then(() => renderKakaoMap(container))
    .catch(() => {
      showMapFallback('지도를 불러오지 못했습니다. 아래 버튼으로 지도 앱에서 확인해주세요.');
    });
}

function loadKakaoMapSdk() {
  if (window.kakao && window.kakao.maps) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${CONFIG.kakaoMapKey}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다'));
    document.head.appendChild(script);
  });
}

function renderKakaoMap(container) {
  // 좌표를 직접 적어두지 않고 주소로 찾습니다. CONFIG.venueAddress만 고치면 지도도 따라갑니다.
  new kakao.maps.services.Geocoder().addressSearch(CONFIG.venueAddress, (result, status) => {
    if (status !== kakao.maps.services.Status.OK || !result.length) {
      showMapFallback('주소를 찾지 못했습니다. 아래 버튼으로 지도 앱에서 확인해주세요.');
      return;
    }

    const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
    const map = new kakao.maps.Map(container, { center: coords, level: 4 });
    const marker = new kakao.maps.Marker({ map, position: coords });

    new kakao.maps.InfoWindow({
      content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;">${CONFIG.venueName}</div>`,
    }).open(map, marker);

    // 손가락으로 페이지를 스크롤하다 지도에 걸려 멈추는 것을 막습니다.
    map.setZoomable(false);
    kakao.maps.event.addListener(map, 'click', () => map.setZoomable(true));

    setMapLinks(coords);
  });
}

function setMapLinks(coords) {
  const name = encodeURIComponent(CONFIG.venueName);
  const query = encodeURIComponent(CONFIG.venueAddress);

  const kakaoLink = document.getElementById('mapLinkKakao');
  if (kakaoLink) {
    kakaoLink.href = coords
      ? `https://map.kakao.com/link/to/${name},${coords.getLat()},${coords.getLng()}`
      : `https://map.kakao.com/link/search/${query}`;
  }

  const naverLink = document.getElementById('mapLinkNaver');
  if (naverLink) naverLink.href = `https://map.naver.com/p/search/${query}`;
}

function showMapFallback(message) {
  const container = document.getElementById('map');
  const fallback = document.getElementById('mapFallback');
  if (container) container.hidden = true;
  if (fallback) {
    fallback.hidden = false;
    fallback.textContent = message;
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
    // writeText는 문서에 포커스가 없는 등의 이유로 거부될 수 있으므로
    // 실패하면 구형 방식으로 한 번 더 시도합니다.
    navigator.clipboard
      .writeText(text)
      .then(() => showToast('복사되었습니다'))
      .catch(() => copyTextFallback(text));
    return;
  }
  copyTextFallback(text);
}

function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    showToast(ok ? '복사되었습니다' : '복사에 실패했습니다');
  } catch (e) {
    showToast('복사에 실패했습니다');
  }
  document.body.removeChild(textarea);
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
