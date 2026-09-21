/* ================================
   첫눈 테마: 연분홍 눈송이

   커버 사진을 지나 인사말(INVITATION)부터 눈송이가 내립니다.
   커버가 화면 대부분을 차지하는 동안에는 숨기고, 다시 커버로
   올라가면 사라집니다.

   눈송이 층은 화면에 고정되어 있고 터치를 가로채지 않습니다
   (pointer-events: none). 모양과 색은 first-snow.css에 있습니다.
   ================================ */
(function () {
  // 화면 움직임 줄이기를 켠 경우에는 만들지 않습니다.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const FLAKE_COUNT = 18;

  const random = (min, max) => min + Math.random() * (max - min);

  document.addEventListener('DOMContentLoaded', () => {
    const layer = document.createElement('div');
    layer.className = 'snowfall';
    layer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < FLAKE_COUNT; i++) {
      const flake = document.createElement('span');
      const size = random(8, 24);
      const duration = random(10, 20);

      flake.className = 'snowflake';
      flake.style.left = `${random(0, 100)}%`;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.opacity = random(0.5, 0.95).toFixed(2);
      flake.style.animationDuration = `${duration}s`;
      // 음수 지연으로 처음 나타날 때부터 이미 내리는 중인 상태가 됩니다.
      flake.style.animationDelay = `${-random(0, duration)}s`;
      layer.appendChild(flake);
    }

    document.body.appendChild(layer);

    const cover = document.querySelector('.cover');
    if (!cover || !('IntersectionObserver' in window)) {
      layer.classList.add('is-visible');
      return;
    }

    // 커버가 30% 미만으로 보일 때(= 인사말이 화면에 들어왔을 때)부터 보입니다.
    new IntersectionObserver(
      ([entry]) => {
        layer.classList.toggle('is-visible', entry.intersectionRatio < 0.3);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    ).observe(cover);
  });
})();
