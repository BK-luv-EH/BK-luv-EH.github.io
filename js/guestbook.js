/* ================================
   방명록

   backend
   - 'local'    설정 없이 바로 동작하지만 글을 쓴 브라우저에서만 보입니다.
                (개발 / 디자인 확인용)
   - 'firebase' 실제 배포용. 아래 firebase 항목을 채우면 모든 하객이
                같은 방명록을 보게 됩니다. 설정 방법은 README.md 참고.

   비밀번호는 원문을 저장하지 않고 SHA-256 해시만 저장합니다.
   ================================ */
const GUESTBOOK_CONFIG = {
  backend: 'firebase',
  pageSize: 5,
  maxNameLength: 10,
  maxMessageLength: 300,
  minPasswordLength: 4,
  // 값을 넣어두면 이 비밀번호로 어떤 글이든 삭제할 수 있습니다 (신랑신부용).
  adminPassword: '1q2w3e4r!@#',
  // Firebase 콘솔 > 프로젝트 설정 > 웹 앱에서 발급받은 값으로 교체하세요.
  firebase: {
    apiKey: "AIzaSyD6FAb8AlJ3gWV1TbnzfWKNeVAQKuHjiEI",
    authDomain: "mobile-invitation-697ea.firebaseapp.com",
    projectId: "mobile-invitation-697ea",
    storageBucket: "mobile-invitation-697ea.firebasestorage.app",
    messagingSenderId: "175366107413",
    appId: "1:175366107413:web:e6d68c802b78f2b895f91c",
    measurementId: "G-ZVB2JNV8D3",
  },
  firebaseCollection: 'guestbook',
};

const FIREBASE_SDK_VERSION = '10.12.0';

/* ---------- 저장소 어댑터 ---------- */

const LocalStore = {
  storageKey: 'bk-eh-guestbook',

  async list() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  async add(entry) {
    const items = await this.list();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    items.push({ id, ...entry });
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  },

  async remove(id) {
    const items = (await this.list()).filter((entry) => entry.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  },
};

const FirebaseStore = {
  _ready: null,
  _db: null,
  _sdk: null,

  _init() {
    if (this._ready) return this._ready;
    this._ready = (async () => {
      const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
      const [appSdk, firestoreSdk] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-firestore.js`),
      ]);
      const app = appSdk.initializeApp(GUESTBOOK_CONFIG.firebase);
      this._sdk = firestoreSdk;
      this._db = firestoreSdk.getFirestore(app);
    })();
    return this._ready;
  },

  async list() {
    await this._init();
    const { collection, getDocs, orderBy, query } = this._sdk;
    const ref = collection(this._db, GUESTBOOK_CONFIG.firebaseCollection);
    const snapshot = await getDocs(query(ref, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async add(entry) {
    await this._init();
    const { addDoc, collection } = this._sdk;
    await addDoc(collection(this._db, GUESTBOOK_CONFIG.firebaseCollection), entry);
  },

  async remove(id) {
    await this._init();
    const { deleteDoc, doc } = this._sdk;
    await deleteDoc(doc(this._db, GUESTBOOK_CONFIG.firebaseCollection, id));
  },
};

function guestbookStore() {
  if (GUESTBOOK_CONFIG.backend === 'firebase') {
    if (!GUESTBOOK_CONFIG.firebase.projectId) {
      throw new Error('Firebase 설정이 비어 있습니다. GUESTBOOK_CONFIG.firebase 값을 채워주세요.');
    }
    return FirebaseStore;
  }
  return LocalStore;
}

/* ---------- 상태 ---------- */

let gbEntries = [];
let gbVisibleCount = GUESTBOOK_CONFIG.pageSize;
let gbPendingDeleteId = null;

document.addEventListener('DOMContentLoaded', initGuestbook);

function initGuestbook() {
  const form = document.getElementById('guestbookForm');
  if (!form) return;

  const messageEl = document.getElementById('gbMessage');
  const nameEl = document.getElementById('gbName');
  const passwordEl = document.getElementById('gbPassword');

  nameEl.maxLength = GUESTBOOK_CONFIG.maxNameLength;
  messageEl.maxLength = GUESTBOOK_CONFIG.maxMessageLength;
  passwordEl.placeholder = `비밀번호 ${GUESTBOOK_CONFIG.minPasswordLength}자 이상`;

  form.addEventListener('submit', handleGuestbookSubmit);
  messageEl.addEventListener('input', updateGuestbookCounter);
  updateGuestbookCounter();

  const moreBtn = document.getElementById('gbMore');
  moreBtn.addEventListener('click', () => {
    gbVisibleCount += GUESTBOOK_CONFIG.pageSize;
    renderGuestbook();
  });

  initGuestbookModal();
  loadGuestbook();
}

async function loadGuestbook() {
  const list = document.getElementById('guestbookList');
  const status = document.getElementById('gbStatus');

  status.hidden = false;
  status.textContent = '방명록을 불러오는 중입니다...';
  list.textContent = '';

  try {
    const entries = await guestbookStore().list();
    gbEntries = entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    status.hidden = true;
  } catch (e) {
    console.error(e);
    gbEntries = [];
    status.textContent = '방명록을 불러오지 못했습니다.';
  }

  renderGuestbook();
}

function renderGuestbook() {
  const list = document.getElementById('guestbookList');
  const empty = document.getElementById('gbEmpty');
  const moreBtn = document.getElementById('gbMore');
  const status = document.getElementById('gbStatus');

  list.textContent = '';
  gbEntries.slice(0, gbVisibleCount).forEach((entry) => {
    list.appendChild(createGuestbookItem(entry));
  });

  empty.hidden = gbEntries.length > 0 || !status.hidden;

  const remaining = gbEntries.length - gbVisibleCount;
  moreBtn.hidden = remaining <= 0;
  moreBtn.textContent = `이전 메시지 ${remaining}개 더보기`;
}

function createGuestbookItem(entry) {
  const item = document.createElement('li');
  item.className = 'gb-item';

  const head = document.createElement('div');
  head.className = 'gb-item-head';

  const name = document.createElement('span');
  name.className = 'gb-item-name';
  name.textContent = entry.name;

  const date = document.createElement('span');
  date.className = 'gb-item-date';
  date.textContent = formatGuestbookDate(entry.createdAt);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'gb-item-delete';
  deleteBtn.setAttribute('aria-label', `${entry.name}님의 메시지 삭제`);
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => openGuestbookModal(entry.id));

  head.append(name, date, deleteBtn);

  const message = document.createElement('p');
  message.className = 'gb-item-message';
  message.textContent = entry.message;

  item.append(head, message);
  return item;
}

function formatGuestbookDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}`;
}

function updateGuestbookCounter() {
  const messageEl = document.getElementById('gbMessage');
  const counter = document.getElementById('gbCounter');
  counter.textContent = `${messageEl.value.length} / ${GUESTBOOK_CONFIG.maxMessageLength}`;
}

async function handleGuestbookSubmit(event) {
  event.preventDefault();

  const nameEl = document.getElementById('gbName');
  const passwordEl = document.getElementById('gbPassword');
  const messageEl = document.getElementById('gbMessage');
  const submitBtn = document.getElementById('gbSubmit');

  const name = nameEl.value.trim();
  const password = passwordEl.value.trim();
  const message = messageEl.value.trim();

  if (!name || !message) {
    guestbookToast('이름과 메시지를 입력해주세요');
    return;
  }
  if (password.length < GUESTBOOK_CONFIG.minPasswordLength) {
    guestbookToast(`비밀번호는 ${GUESTBOOK_CONFIG.minPasswordLength}자 이상 입력해주세요`);
    return;
  }

  submitBtn.disabled = true;
  try {
    await guestbookStore().add({
      name,
      message,
      passwordHash: await hashGuestbookPassword(password),
      createdAt: Date.now(),
    });
    event.target.reset();
    updateGuestbookCounter();
    gbVisibleCount = GUESTBOOK_CONFIG.pageSize;
    await loadGuestbook();
    guestbookToast('축하 메시지가 등록되었습니다');
  } catch (e) {
    console.error(e);
    guestbookToast('등록에 실패했습니다');
  } finally {
    submitBtn.disabled = false;
  }
}

/* ---------- 삭제 확인 ---------- */

function initGuestbookModal() {
  const modal = document.getElementById('gbModal');
  const input = document.getElementById('gbDeletePassword');

  modal.querySelectorAll('[data-gb-close]').forEach((el) => {
    el.addEventListener('click', closeGuestbookModal);
  });

  document.getElementById('gbDeleteConfirm').addEventListener('click', confirmGuestbookDelete);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmGuestbookDelete();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeGuestbookModal();
  });
}

function openGuestbookModal(id) {
  gbPendingDeleteId = id;
  const modal = document.getElementById('gbModal');
  const input = document.getElementById('gbDeletePassword');
  modal.hidden = false;
  input.value = '';
  input.focus();
}

function closeGuestbookModal() {
  gbPendingDeleteId = null;
  document.getElementById('gbModal').hidden = true;
}

async function confirmGuestbookDelete() {
  const entry = gbEntries.find((e) => e.id === gbPendingDeleteId);
  if (!entry) {
    closeGuestbookModal();
    return;
  }

  const input = document.getElementById('gbDeletePassword');
  const password = input.value.trim();
  if (!password) {
    guestbookToast('비밀번호를 입력해주세요');
    return;
  }

  const isAdmin = GUESTBOOK_CONFIG.adminPassword && password === GUESTBOOK_CONFIG.adminPassword;
  const matches = (await hashGuestbookPassword(password)) === entry.passwordHash;
  if (!isAdmin && !matches) {
    guestbookToast('비밀번호가 일치하지 않습니다');
    input.select();
    return;
  }

  const confirmBtn = document.getElementById('gbDeleteConfirm');
  confirmBtn.disabled = true;
  try {
    await guestbookStore().remove(entry.id);
    closeGuestbookModal();
    await loadGuestbook();
    guestbookToast('메시지가 삭제되었습니다');
  } catch (e) {
    console.error(e);
    guestbookToast('삭제에 실패했습니다');
  } finally {
    confirmBtn.disabled = false;
  }
}

/* ---------- 유틸 ---------- */

async function hashGuestbookPassword(password) {
  // crypto.subtle은 HTTPS(또는 localhost)에서만 제공됩니다.
  if (window.crypto && window.crypto.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 31 + password.charCodeAt(i)) | 0;
  }
  return `plain:${(hash >>> 0).toString(16)}`;
}

function guestbookToast(message) {
  if (typeof showToast === 'function') {
    showToast(message);
  } else {
    alert(message);
  }
}
