(function () {
  "use strict";

  var stage = document.getElementById("material");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var statusText = document.getElementById("status");
  var previousButton = document.getElementById("previous");
  var nextButton = document.getElementById("next");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");

  var index = 0;
  var completed = false;
  var configured = false;
  var reduced = false;
  var announceTimer = null;
  var announceCount = 0;
  var audio = null;

  function post(type, body) {
    window.parent.postMessage(Object.assign({ ifp: 1, type: type }, body || {}), "*");
  }

  function announce() {
    post("ready");
    post("progress", { value: (index + 1) / steps.length });
  }

  function stopAnnouncing() {
    if (announceTimer !== null) {
      window.clearInterval(announceTimer);
      announceTimer = null;
    }
  }

  function startAnnouncing() {
    stopAnnouncing();
    announceCount = 0;
    announce();
    announceTimer = window.setInterval(function () {
      if (configured) {
        stopAnnouncing();
        return;
      }
      announceCount += 1;
      if (announceCount > 25) {
        stopAnnouncing();
        return;
      }
      announce();
    }, 400);
  }

  // Suara dibuat lewat WebAudio: tidak ada berkas audio, tidak ada CDN.
  function context() {
    if (audio) {
      return audio;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    audio = new Ctor();
    return audio;
  }

  function tone(ctx, from, to, duration, type, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function noise(ctx, duration, volume, cutoff) {
    var frames = Math.floor(ctx.sampleRate * duration);
    var buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frames; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    var gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  function playSound(name) {
    if (reduced || name === "tak-ada" || !audio || audio.state !== "running") {
      return;
    }
    var ctx = audio;
    if (name === "bel") {
      tone(ctx, 880, 1320, 0.28, "sine", 0.18);
      window.setTimeout(function () {
        tone(ctx, 1320, 1760, 0.22, "sine", 0.12);
      }, 130);
    } else if (name === "klik") {
      tone(ctx, 420, 260, 0.08, "square", 0.1);
    } else if (name === "whoosh") {
      tone(ctx, 720, 120, 0.35, "sawtooth", 0.08);
    } else if (name === "tepuk") {
      noise(ctx, 0.18, 0.35, 2200);
    }
  }

  function clearEffects(element) {
    var layer = element.querySelector(".fx");
    if (layer) {
      layer.textContent = "";
    }
  }

  function confetti(element) {
    var layer = element.querySelector(".fx");
    if (!layer) {
      return;
    }
    var colors = ["#0f766e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];
    for (var i = 0; i < 18; i += 1) {
      var piece = document.createElement("span");
      piece.className = "fx-piece";
      piece.style.left = 6 + Math.random() * 88 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--drift", (Math.random() * 120 - 60).toFixed(0) + "px");
      piece.style.animationDelay = (Math.random() * 220).toFixed(0) + "ms";
      layer.appendChild(piece);
    }
  }

  function letterRain(element, title) {
    var layer = element.querySelector(".fx");
    if (!layer) {
      return;
    }
    var letters = title.replace(/\s+/g, " ").slice(0, 24);
    for (var i = 0; i < letters.length; i += 1) {
      if (letters.charAt(i) === " ") {
        continue;
      }
      var letter = document.createElement("span");
      letter.className = "fx-letter";
      letter.textContent = letters.charAt(i);
      letter.style.left = 4 + Math.random() * 90 + "%";
      letter.style.setProperty("--drift", (Math.random() * 60 - 30).toFixed(0) + "px");
      letter.style.animationDelay = (i * 45).toFixed(0) + "ms";
      layer.appendChild(letter);
    }
  }

  function show(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    stage.setAttribute("data-stage", String(index));
    steps.forEach(function (item, position) {
      if (position === index) {
        item.setAttribute("data-active", "true");
      } else {
        item.removeAttribute("data-active");
        clearEffects(item);
      }
    });
    var current = steps[index];
    if (current) {
      var effect = current.getAttribute("data-effect");
      clearEffects(current);
      if (!reduced && effect === "konfeti") {
        confetti(current);
      }
      if (!reduced && effect === "hujan-huruf") {
        var heading = current.querySelector(".step-title");
        letterRain(current, heading ? heading.textContent || "" : "");
      }
      playSound(current.getAttribute("data-sound") || "tak-ada");
    }
    previousButton.disabled = index === 0;
    nextButton.disabled = index === steps.length - 1;
    statusText.textContent = "Langkah " + (index + 1) + " dari " + steps.length + ".";
    post("progress", { value: (index + 1) / steps.length });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.ifp !== 1) {
      return;
    }
    if (data.type === "config") {
      configured = true;
      reduced = Boolean(data.reducedMotion);
      stage.classList.toggle("reduced-motion", reduced);
      stopAnnouncing();
      return;
    }
    if (data.type === "hello") {
      announce();
    }
  });

  // Autoplay browser mengunci audio sampai ada gerakan pengguna.
  function unlock() {
    var ctx = context();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  }
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  previousButton.addEventListener("click", function () {
    show(index - 1);
  });
  nextButton.addEventListener("click", function () {
    show(index + 1);
  });
  completeButton.addEventListener("click", function () {
    if (completed) {
      return;
    }
    completed = true;
    completeButton.disabled = true;
    completeButton.textContent = "Sudah selesai";
    statusText.textContent = "Materi ditandai selesai.";
    post("complete", { value: 1 });
  });
  exitButton.addEventListener("click", function () {
    post("request-exit");
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      show(index - 1);
    } else if (event.key === "Home") {
      show(0);
    } else if (event.key === "End") {
      show(steps.length - 1);
    }
  });

  show(0);
  startAnnouncing();
})();
