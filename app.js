(() => {
  const audio = document.getElementById('bgAudio');
  const btn = document.getElementById('musicBtn');
  const label = document.getElementById('musicLabel');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
  };

  // Music (mobile needs user interaction)
  if (btn && audio) {
    btn.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          await audio.play();
          label.textContent = 'Pause';
          showToast('Musique activée');
        } else {
          audio.pause();
          label.textContent = 'Play';
          showToast('Musique en pause');
        }
      } catch (e) {
        showToast('Ajoute un fichier: assets/music.mp3');
      }
    }, { passive:true });

    let started = false;
    const kick = async () => {
      if (started) return;
      started = true;
      try { await audio.play(); label.textContent = 'Pause'; } catch {}
      window.removeEventListener('pointerdown', kick);
    };
    window.addEventListener('pointerdown', kick, { passive:true });
  }

  // ---- Scratch helper for multiple canvases ----
  function initScratch(canvas) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const labelN = canvas.dataset.label || '';

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.floor(rect.width * DPR);
      canvas.height = Math.floor(rect.height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Grey layer
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#7f7f86';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Text
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.font = '900 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GRATTE', rect.width/2, rect.height/2 - 6);
      ctx.font = '800 11px Inter, system-ui, sans-serif';
      ctx.fillText('SURPRISE ' + labelN, rect.width/2, rect.height/2 + 12);
    }

    let isDown = false;
    let last = null;

    function scratchAt(x, y) {
      const rect = canvas.getBoundingClientRect();
      const px = x - rect.left;
      const py = y - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(28, rect.width * 0.18);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (last) {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      last = { x: px, y: py };
    }

    function onDown(e){
      isDown = true; last = null;
      const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
      scratchAt(p.clientX, p.clientY);
      e.preventDefault();
    }
    function onMove(e){
      if (!isDown) return;
      const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
      scratchAt(p.clientX, p.clientY);
      e.preventDefault();
    }
    function onUp(){ isDown = false; last = null; }

    // Events
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    canvas.addEventListener('touchstart', onDown, { passive:false });
    canvas.addEventListener('touchmove', onMove, { passive:false });
    canvas.addEventListener('touchend', onUp, { passive:true });
    canvas.addEventListener('touchcancel', onUp, { passive:true });

    window.addEventListener('resize', resize, { passive:true });
    resize();
  }

  document.querySelectorAll('.scratchCanvas').forEach(initScratch);
})();
