(() => {
  'use strict';

  const START_NG = 'https://start.ng';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startButton = document.getElementById('start');
  const laneX = [190, 360, 530];

  const state = {
    running: false,
    lane: 1,
    objects: [],
    score: 0,
    gems: 0,
    glam: 0,
    speed: 190,
    spawn: 0.6,
    last: 0,
    elapsed: 0,
    bounce: 0,
    best: 0,
    player: null,
    connected: false,
    raf: 0
  };

  const $ = id => document.getElementById(id);

  function star(x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? size : size * 0.42;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;

      if (!i) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function round(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

function background() {
  ctx.fillStyle = '#fff8fc';
  ctx.fillRect(0, 0, 720, 620);
  ctx.fillStyle = '#fff3f9';
  ctx.beginPath();
  ctx.moveTo(130, 0);
  ctx.lineTo(590, 0);
  ctx.lineTo(660, 620);
  ctx.lineTo(60, 620);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f2cfe2';
  ctx.lineWidth = 3;
  ctx.setLineDash([15, 18]);
  ctx.beginPath();
  ctx.moveTo(275, 0);
  ctx.lineTo(250, 620);
  ctx.moveTo(445, 0);
  ctx.lineTo(470, 620);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 12; i++) {
    const y = (i * 67 + state.elapsed * 18) % 650 - 20;
    const x = i % 2 === 0
      ? 40 + (i % 3) * 15
      : 650 + (i % 3) * 12;

    star(x, y, 5 + i % 3, '#e4b3d4', 0.75);
  }
}

  function gem(x, y, size = 16) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#b79af0';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ad8de9';
    ctx.strokeStyle = '#8664ce';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.8, -size * 0.25);
    ctx.lineTo(size * 0.55, size * 0.75);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.55, size * 0.75);
    ctx.lineTo(-size * 0.8, -size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f8edff';
    ctx.beginPath();
    ctx.moveTo(0, -size + 4);
    ctx.lineTo(0, size - 4);
    ctx.stroke();
    ctx.restore();
  }

  function purse(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#c24d91';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -12, 13, Math.PI, 0);
    ctx.stroke();

    const g = ctx.createLinearGradient(-22, -7, 22, 25);
    g.addColorStop(0, '#f7a3cd');
    g.addColorStop(1, '#d9579d');

    round(-22, -9, 44, 35, 10, g, '#c64a91');

    ctx.fillStyle = '#ffe8f5';
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function puddle(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#9ec9f3';
    ctx.strokeStyle = '#6ba9e4';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(0, 7, 27, 15, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#eaf7ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-6, 4, 8, Math.PI * 1.05, Math.PI * 1.75);
    ctx.stroke();

    ctx.restore();
  }

  function player() {
    const x = laneX[state.lane];
    const y = 500 + Math.sin(state.bounce) * 3;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#d9afd0aa';
    ctx.beginPath();
    ctx.ellipse(0, 42, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    round(-18, 22, 13, 29, 6, '#7e5c9f');
    round(5, 22, 13, 29, 6, '#7e5c9f');
    round(-23, 43, 23, 10, 5, '#e967a9');
    round(1, 43, 23, 10, 5, '#e967a9');

    ctx.fillStyle = '#f28abc';
    ctx.strokeStyle = '#ce5b9b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.lineTo(15, -5);
    ctx.lineTo(29, 30);
    ctx.quadraticCurveTo(0, 40, -29, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#e6ad91';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(-25, 17);
    ctx.moveTo(13, 0);
    ctx.lineTo(25, 17);
    ctx.stroke();

    round(-6, -16, 12, 13, 4, '#e6ad91');

    ctx.fillStyle = '#efc2a7';
    ctx.beginPath();
    ctx.arc(0, -30, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a3650';
    ctx.beginPath();
    ctx.arc(0, -36, 24, Math.PI, Math.PI * 2);
    ctx.lineTo(23, -20);
    ctx.quadraticCurveTo(15, -9, 13, -19);
    ctx.lineTo(-13, -19);
    ctx.quadraticCurveTo(-18, -7, -23, -22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4a3043';
    ctx.beginPath();
    ctx.arc(-8, -29, 2.2, 0, Math.PI * 2);
    ctx.arc(8, -29, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c76e83';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -23, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.fillStyle = '#f48eb7';
    ctx.beginPath();
    ctx.arc(-14, -23, 4, 0, Math.PI * 2);
    ctx.arc(14, -23, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d94e9a';
    ctx.beginPath();
    ctx.moveTo(-5, -51);
    ctx.lineTo(-19, -60);
    ctx.lineTo(-17, -45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(3, -51);
    ctx.lineTo(18, -61);
    ctx.lineTo(16, -44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffdbef';
    ctx.beginPath();
    ctx.arc(-1, -51, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function render() {
    background();

    state.objects.forEach(o => {
      if (o.type === 'gem') {
        gem(laneX[o.lane], o.y);
      } else if (o.type === 'glam') {
        purse(laneX[o.lane], o.y);
      } else {
        puddle(laneX[o.lane], o.y);
      }
    });

    player();
  }

  function hud() {
    $('score').textContent = Math.floor(state.score);
    $('gems').textContent = state.gems;
    $('glam').textContent = state.glam;
    $('best').innerHTML = `${state.best} <small>pts</small>`;

    $('level').textContent = String(
      Math.min(99, 1 + Math.floor(state.elapsed / 18))
    ).padStart(2, '0');

    $('progress').style.width = `${Math.min(100, state.gems * 10)}%`;

    $('mission-count').textContent = `${Math.min(10, state.gems)} / 10 gems`;

    $('mission-status').textContent =
      state.gems >= 10 ? 'Mission complete! ✨' : "Let's go!";
  }

  function reset() {
    state.running = true;
    state.lane = 1;
    state.objects = [];
    state.score = 0;
    state.gems = 0;
    state.glam = 0;
    state.speed = 190;
    state.spawn = 0.6;
    state.elapsed = 0;
    state.bounce = 0;
    state.last = performance.now();

    overlay.classList.add('hidden');
    hud();

    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function spawn() {
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();

    state.objects.push({
      type: r < 0.56 ? 'gem' : r < 0.73 ? 'glam' : 'puddle',
      lane,
      y: -35,
      checked: false
    });
  }

  function loop(now) {
    if (!state.running) return;

    const dt = Math.min(0.04, Math.max(0, (now - state.last) / 1000));

    state.last = now;
    state.elapsed += dt;
    state.speed = Math.min(370, 190 + state.elapsed * 4.2);
    state.score += dt * 3;
    state.spawn -= dt;

    if (state.spawn <= 0) {
      spawn();
      state.spawn = Math.max(0.48, 1.05 - state.elapsed * 0.008)
        + Math.random() * 0.22;
    }

    state.bounce += dt * 12;

    for (const o of state.objects) {
      o.y += state.speed * dt;

      if (!o.checked && o.y > 465 && o.y < 545 && o.lane === state.lane) {
        o.checked = true;

        if (o.type === 'gem') {
          state.gems++;
          state.score += 10;
        } else if (o.type === 'glam') {
          state.glam++;
          state.score += 25;
        } else {
          end();
          return;
        }
      }
    }

    state.objects = state.objects.filter(
      o => o.y < 670 && !(o.checked && o.type !== 'puddle')
    );

    hud();
    render();

    state.raf = requestAnimationFrame(loop);
  }

  function end() {
    state.running = false;

    const score = Math.floor(state.score);

    if (score > state.best) {
      state.best = score;

      try {
        localStorage.setItem('glamDashBest', String(score));
      } catch (_) {}
    }

    hud();

    overlay.classList.remove('hidden');

    $('overlay-title').textContent = 'Still iconic, darling!';

    $('overlay-copy').textContent =
      `You scored ${score} points, found ${state.gems} gems, and collected ${state.glam} glam drops. Ready for another run?`;

    $('start').innerHTML = 'Run it back <span>→</span>';

    saveScore(score);
    loadLeaderboard();
    render();
  }

  function move(d) {
    if (state.running) {
      state.lane = Math.max(0, Math.min(2, state.lane + d));
    }
  }

  document.addEventListener('keydown', e => {
    if (!state.running) return;

    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();

      move(
        e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a' ? -1 : 1
      );
    }
  });

  $('left').addEventListener('click', () => move(-1));
  $('right').addEventListener('click', () => move(1));
  startButton.addEventListener('click', reset);

  let framePromise;

  function connectFrame() {
    if (!framePromise) {
      framePromise = new Promise((resolve, reject) => {
        const f = document.createElement('iframe');

        f.src = `${START_NG}/connect`;
        f.hidden = true;
        f.title = 'Start.ng player connection';
        f.onload = () => resolve(f);
        f.onerror = reject;

        document.body.appendChild(f);
      });
    }

    return framePromise;
  }

  async function ask(message, replyType, timeout = 5000) {
    let frame;

    try {
      frame = await connectFrame();
    } catch (_) {
      return null;
    }

    return new Promise(resolve => {
      const requestId = Math.random().toString(36).slice(2);

      const finish = reply => {
        clearTimeout(timer);
        removeEventListener('message', onMessage);
        resolve(reply);
      };

      const timer = setTimeout(() => finish(null), timeout);

      function onMessage(e) {
        if (e.origin !== START_NG || e.source !== frame.contentWindow) {
          return;
        }

        if (
          e.data?.type === replyType &&
          e.data.requestId === requestId
        ) {
          finish(e.data);
        }
      }

      addEventListener('message', onMessage);

      frame.contentWindow.postMessage(
        { ...message, requestId },
        START_NG
      );
    });
  }

  function signInUrl() {
    return `${START_NG}/?return_to=${encodeURIComponent(
      location.origin + location.pathname
    )}`;
  }

  // Corrected player profile rendering.
  function setPlayer(p, guest) {
    $('player-name').textContent = p?.name || 'Guest Adventurer';

    $('player-handle').textContent = guest
      ? 'Guest · let’s sparkle'
      : (p?.account ? `@${p.account}` : 'Start.ng player');

    const avatar = $('player-avatar');
    const face = p?.face;

    // Remove any previously displayed avatar.
    avatar.replaceChildren();
    avatar.classList.remove('has-image');

    if (
      typeof face === 'string' &&
      /^(data:image\/|https?:\/\/)/i.test(face)
    ) {
      const img = document.createElement('img');

      img.src = face;
      img.alt = `${p?.name || 'Player'} avatar`;

      avatar.appendChild(img);
      avatar.classList.add('has-image');
    } else {
      // Display an emoji or the default ribbon instead.
      avatar.textContent = face || '🎀';
    }

    $('signin').textContent = guest ? 'Sign in' : 'Connected ✓';
    $('signin').href = guest ? signInUrl() : START_NG + '/';
    $('signin').target = guest ? '_self' : '_blank';

    state.player = guest ? null : p;
  }

  async function refreshPlayer() {
    const reply = await ask(
      { type: 'startng:whoami' },
      'startng:user'
    );

    if (reply?.user) {
      setPlayer(reply.user, false);
      state.connected = true;
    } else if (reply?.guest) {
      setPlayer(reply.guest, true);
      state.connected = true;
    } else {
      setPlayer(
        { name: 'Guest Adventurer', face: '🎀' },
        true
      );

      state.connected = false;
    }
  }

  async function saveScore(score) {
    if (!state.player || !Number.isFinite(score)) return;

    const r = await ask(
      {
        type: 'startng:score',
        stats: {
          score: Math.max(0, Math.min(1000000000, Math.floor(score)))
        }
      },
      'startng:scoreSaved'
    );

    $('leader-note').textContent = r?.ok
      ? (
          r.result?.improved
            ? 'New personal best saved to Start.ng. Keep that crown shining! 👑'
            : 'Your score has been sent to Start.ng. One more run could beat your best!'
        )
      : 'Your local best is saved on this device. Sign in on Start.ng to submit scores.';
  }

  async function loadLeaderboard() {
    const r = await ask(
      { type: 'startng:leaderboard', limit: 10 },
      'startng:leaderboardData'
    );

    const list = $('leader-list');

    if (!r?.ok || !Array.isArray(r.entries) || !r.entries.length) {
      list.innerHTML =
        '<li class="empty">The runway is waiting for its first star ✨</li>';

      if (!state.connected) {
        $('leader-note').textContent =
          'Leaderboard unlocks when the game is live on Start.ng.';
      }

      return;
    }

    list.replaceChildren();

    r.entries.slice(0, 10).forEach((entry, i) => {
      const li = document.createElement('li');
      const rank = document.createElement('span');
      const name = document.createElement('span');
      const score = document.createElement('strong');

      rank.className = 'rank';
      rank.textContent = String(i + 1);
      name.textContent = entry.name || entry.account || 'Glam player';
      score.textContent = `${entry.stats?.score ?? 0} pts`;

      li.append(rank, name, score);
      list.append(li);
    });

    $('leader-note').textContent =
      'The top glam runners on Start.ng. Can you claim the crown?';
  }

  try {
    state.best = Math.max(
      0,
      Number(localStorage.getItem('glamDashBest')) || 0
    );
  } catch (_) {
    state.best = 0;
  }

  hud();
  render();
  refreshPlayer();
  loadLeaderboard();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshPlayer();
  });

  window.addEventListener('focus', refreshPlayer);
})();

