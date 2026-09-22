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
  // 주소가 길어 화면에서는 두 줄로 나눕니다. 이 낱말 앞에서 줄을 바꿉니다.
  // 복사·지도 검색에는 위의 한 줄짜리 원본이 그대로 쓰입니다.
  venueAddressBreakBefore: '신도림테크노마트',
  // 카카오 개발자센터에서 발급받은 JavaScript 키. 비워두면 지도 대신 안내 문구가 표시됩니다.
  kakaoMapKey: 'ef5c92b80f52634d05d1e5abf4752244',
  // 카카오톡 공유도 같은 JavaScript 키를 씁니다.
  kakaoShareKey: 'ef5c92b80f52634d05d1e5abf4752244',
  // 공유되는 실제 주소. 로컬에서 눌러도 배포된 주소가 전달되도록 고정합니다.
  siteUrl: 'https://bk-luv-eh.github.io',
  // 카카오톡 카드에 들어갈 세로 사진. 갤러리를 손봐도 깨지지 않도록 전용 파일을 씁니다.
  // 사진을 바꾸면 ?v= 숫자도 올려주세요. 카카오가 주소 기준으로 이미지를 캐시해서
  // 같은 주소면 예전 사진이 계속 나옵니다. 가로·세로도 실제 파일과 맞춰야 카드가 잘리지 않습니다.
  shareImage: 'images/share-card.jpg?v=2',
  shareImageWidth: 1153,
  shareImageHeight: 1440,
};

const KAKAO_SDK_VERSION = '2.7.5';

document.addEventListener('DOMContentLoaded', () => {
  renderTexts();
  renderCalendar();
  renderDday();
  initAccordion();
  initCopyButtons();
  initShare();
  initMap();
  initBgm();
  initCoverScroll();
  initToTop();
  initGallery();
});

function initGallery() {
  const button = document.getElementById('galleryMore');
  const gallery = document.getElementById('gallery');
  if (!button || !gallery) return;

  const hidden = gallery.querySelectorAll('.gallery-item.is-hidden');
  if (!hidden.length) {
    button.hidden = true;
    return;
  }

  let expanded = false;
  const total = gallery.querySelectorAll('.gallery-item').length;

  const render = () => {
    hidden.forEach((item) => item.classList.toggle('is-hidden', !expanded));
    button.textContent = expanded ? '사진 접기' : `사진 더보기 (${total}장)`;
    button.setAttribute('aria-expanded', String(expanded));
  };

  button.addEventListener('click', () => {
    expanded = !expanded;
    render();
    // 접을 때는 갤러리 윗부분이 화면 밖으로 밀려나므로 되돌려줍니다.
    if (!expanded) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  render();
  initLightbox(gallery);
}

/* ---------- 갤러리 크게 보기 ---------- */

function initLightbox(gallery) {
  const box = document.getElementById('lightbox');
  const track = document.getElementById('lightboxTrack');
  if (!box || !track) return;

  // 격자에는 가벼운 썸네일(images/gallery/thumb/)을 쓰고,
  // 크게 볼 때만 같은 이름의 고화질 원본(images/gallery/)을 불러옵니다.
  const sources = Array.from(gallery.querySelectorAll('.gallery-item')).map((img) =>
    img.getAttribute('src').replace('/gallery/thumb/', '/gallery/')
  );
  if (!sources.length) return;

  const countEl = document.getElementById('lightboxCount');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let index = 0;

  const slides = sources.map(() => {
    const slide = document.createElement('div');
    slide.className = 'lightbox-slide';
    slide.appendChild(document.createElement('img'));
    track.appendChild(slide);
    return slide;
  });

  // 26장을 한꺼번에 받지 않도록 현재 사진과 좌우 한 장만 불러옵니다.
  const loadNear = () => {
    [index - 1, index, index + 1].forEach((i) => {
      if (i < 0 || i >= slides.length) return;
      const img = slides[i].firstChild;
      if (!img.getAttribute('src')) img.setAttribute('src', sources[i]);
    });
  };

  const setOffset = (px, animate) => {
    track.classList.toggle('is-animating', !!animate);
    track.style.transform = `translateX(${-index * box.clientWidth + px}px)`;
  };

  const render = (animate) => {
    setOffset(0, animate);
    countEl.textContent = `${index + 1} / ${slides.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
    loadNear();
  };

  const go = (next) => {
    index = Math.max(0, Math.min(slides.length - 1, next));
    render(true);
  };

  const open = (start) => {
    index = start;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    render(false);
  };

  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
  };

  gallery.querySelectorAll('.gallery-item').forEach((img, i) => {
    img.addEventListener('click', () => open(i));
  });

  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));
  document.getElementById('lightboxClose').addEventListener('click', close);
  box.querySelectorAll('[data-lightbox-close]').forEach((el) => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  // 손가락으로 밀어서 넘기기
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let horizontal = null;

  track.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      dragging = true;
      horizontal = null;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchmove',
    (e) => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // 첫 움직임의 방향으로 가로/세로 제스처를 판별합니다.
      if (horizontal === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        horizontal = Math.abs(dx) > Math.abs(dy);
      }
      if (!horizontal) return;

      // 양 끝에서는 저항을 주어 더 끌리지 않게 합니다.
      const atEdge = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
      setOffset(atEdge ? dx * 0.25 : dx, false);
    },
    { passive: true }
  );

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (!horizontal) return;
    const dx = (e.changedTouches ? e.changedTouches[0].clientX : startX) - startX;
    const threshold = Math.min(80, box.clientWidth * 0.2);
    if (dx <= -threshold) go(index + 1);
    else if (dx >= threshold) go(index - 1);
    else render(true);
  };

  track.addEventListener('touchend', endDrag);
  track.addEventListener('touchcancel', endDrag);

  window.addEventListener('resize', () => {
    if (!box.hidden) render(false);
  });
}

function initToTop() {
  const button = document.getElementById('toTop');
  if (!button) return;

  // 첫 화면을 지나 스크롤했을 때만 보여줍니다.
  const update = () => {
    button.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initCoverScroll() {
  const button = document.getElementById('coverScroll');
  if (!button) return;

  button.addEventListener('click', () => {
    const target = document.querySelector('.greeting');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

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
  if (venueAddress) renderVenueAddress(venueAddress);
}

function renderVenueAddress(el) {
  // 복사 버튼은 줄바꿈이 섞이지 않도록 한 줄짜리 원본을 쓰게 합니다.
  el.dataset.copyValue = CONFIG.venueAddress;
  el.textContent = '';

  const at = CONFIG.venueAddress.indexOf(CONFIG.venueAddressBreakBefore);
  if (!CONFIG.venueAddressBreakBefore || at <= 0) {
    el.textContent = CONFIG.venueAddress;
    return;
  }

  el.append(
    CONFIG.venueAddress.slice(0, at).trim(),
    document.createElement('br'),
    CONFIG.venueAddress.slice(at)
  );
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

  const couple = `${CONFIG.groom} ♥ ${CONFIG.bride}`;
  el.textContent = '';

  if (diffDays > 0) {
    // 한 줄로 두기엔 길어 '결혼식이' 뒤에서 줄을 바꿉니다.
    el.append(`${couple}의 결혼식이`, document.createElement('br'), `D-${diffDays}일 남았습니다`);
  } else if (diffDays === 0) {
    el.textContent = `오늘은 ${couple}의 결혼식 날입니다`;
  } else {
    el.textContent = `${couple}는 부부가 되었습니다`;
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
      // 화면에서 줄을 나눠 보여주는 값은 data-copy-value에 원본이 들어 있습니다.
      copyText(targetEl.dataset.copyValue || targetEl.textContent.trim());
    });
  });
}

function copyText(text, successMessage) {
  const message = successMessage || '복사되었습니다';

  if (navigator.clipboard && window.isSecureContext) {
    // writeText는 문서에 포커스가 없는 등의 이유로 거부될 수 있으므로
    // 실패하면 구형 방식으로 한 번 더 시도합니다.
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(message))
      .catch(() => copyTextFallback(text, message));
    return;
  }
  copyTextFallback(text, message);
}

function copyTextFallback(text, successMessage) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    showToast(ok ? successMessage || '복사되었습니다' : '복사에 실패했습니다');
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

function shareUrl() {
  // 로컬에서 눌러도 하객에게는 배포된 주소가 전달되어야 합니다.
  return new URL('', `${CONFIG.siteUrl}/`).href;
}

function weddingDateLabel() {
  const d = CONFIG.weddingDate;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const hour24 = d.getHours();
  const ampm = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minutes = d.getMinutes() ? ` ${d.getMinutes()}분` : '';
  return (
    `${d.getFullYear()}년 ${pad(d.getMonth() + 1)}월 ${pad(d.getDate())}일 ` +
    `(${days[d.getDay()]}) ${ampm} ${hour12}시${minutes}`
  );
}

function loadKakaoShareSdk() {
  if (window.Kakao && window.Kakao.Share) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`;
    script.onload = () => {
      try {
        if (!window.Kakao.isInitialized()) window.Kakao.init(CONFIG.kakaoShareKey);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error('카카오 SDK를 불러오지 못했습니다'));
    document.head.appendChild(script);
  });
}

function initShare() {
  const linkBtn = document.getElementById('shareLink');
  if (linkBtn) {
    linkBtn.addEventListener('click', () => {
      copyText(shareUrl());
    });
  }

  const kakaoBtn = document.getElementById('shareKakao');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', () => {
      const link = { mobileWebUrl: shareUrl(), webUrl: shareUrl() };

      loadKakaoShareSdk()
        .then(() => {
          Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `${CONFIG.groom} ♥ ${CONFIG.bride}\n결혼식에 초대합니다.`,
              imageUrl: shareUrl() + CONFIG.shareImage,
              imageWidth: CONFIG.shareImageWidth,
              imageHeight: CONFIG.shareImageHeight,
              link,
            },
            itemContent: {
              items: [{ item: '예식일', itemOp: weddingDateLabel() }],
            },
            buttons: [{ title: '모바일 청첩장 보기', link }],
          });
        })
        .catch((e) => {
          // SDK 차단·팝업 차단 등으로 공유창이 뜨지 못한 경우입니다.
          console.error(e);
          copyText(shareUrl(), '카카오톡 공유를 열지 못했습니다. 링크를 복사했어요');
        });
    });
  }
}
