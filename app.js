// ====== CHỈNH NỘI DUNG Ở ĐÂY ======
const CONFIG = {
  toName: "cậu",
  fromName: "mình",
  songLabel: "🎵 Nhạc: music.mp3",
  text: [
    "Hé lôoo ✨",
    "",
    "Mình viết bức thư nhỏ này để nói rằng:",
    "Cậu quan trọng hơn cậu nghĩ nhiều đó.",
    "",
    "Nếu hôm nay mệt, cho phép bản thân nghỉ một chút nha.",
    "Mai mình lại cố tiếp, nhưng nhẹ nhàng hơn.",
    "",
    "Cảm ơn vì đã xuất hiện 💖"
  ].join("\n")
};
// ================================

const $ = (s) => document.querySelector(s);

const typedEl = $("#typed");
const openBtn = $("#openBtn");
const toggleBtn = $("#toggleMusic");
const replayBtn = $("#replay");
const audio = $("#audio");

$("#toName").textContent = CONFIG.toName;
$("#fromName").textContent = `— from: ${CONFIG.fromName}`;
$("#songLabel").textContent = CONFIG.songLabel;

let typing = false;
let i = 0;
let raf = null;

function typeWriter(speed = 22) {
  cancelAnimationFrame(raf);
  typing = true;
  i = 0;
  typedEl.textContent = "";

  const text = CONFIG.text;
  const step = (t) => {
    // random nhẹ cho tự nhiên
    const jitter = Math.random() * 18;
    const chunk = (Math.random() < 0.12) ? 2 : 1;

    typedEl.textContent += text.slice(i, i + chunk);
    i += chunk;

    if (i < text.length) {
      raf = requestAnimationFrame(() => setTimeout(step, speed + jitter));
    } else {
      typing = false;
      confettiBurst();
    }
  };
  step();
}

async function startAudio() {
  // Trình duyệt thường chặn autoplay có tiếng nếu chưa có "user gesture"
  // Nên ta chỉ gọi play() sau khi người dùng bấm nút. (MDN + Chrome policy)
  try {
    audio.volume = 0.75;
    await audio.play();
    toggleBtn.textContent = "⏸️ Tạm dừng";
  } catch (e) {
    // Nếu vẫn bị chặn, hiện hướng dẫn đơn giản
    toggleBtn.textContent = "▶️ Bật nhạc";
  }
}

function toggleAudio() {
  if (audio.paused) {
    startAudio();
  } else {
    audio.pause();
    toggleBtn.textContent = "▶️ Bật nhạc";
  }
}

openBtn.addEventListener("click", async () => {
  openBtn.disabled = true;
  toggleBtn.disabled = false;
  replayBtn.disabled = false;

  await startAudio();
  typeWriter();
});

toggleBtn.addEventListener("click", toggleAudio);
replayBtn.addEventListener("click", () => typeWriter(18));

// ====== HIỆU ỨNG CONFETTI CANVAS (nhẹ, mượt) ======
const canvas = $("#fx");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

let particles = [];
function confettiBurst() {
  const n = 140;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let k = 0; k < n; k++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * 30,
      y: cy + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 9 - 2,
      r: Math.random() * 4 + 2,
      a: 1,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2
    });
  }
  if (!looping) {
    looping = true;
    requestAnimationFrame(loop);
  }
}

let looping = false;
function loop() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.a > 0.02);
  for (const p of particles) {
    p.vy += 0.15;      // gravity
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.a *= 0.985;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    // không set màu cố định: dùng gradient ngẫu nhiên
    const g = ctx.createLinearGradient(-p.r, 0, p.r, 0);
    g.addColorStop(0, "rgba(255,79,216,.95)");
    g.addColorStop(1, "rgba(124,246,255,.95)");
    ctx.fillStyle = g;
    ctx.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(loop);
  } else {
    looping = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}