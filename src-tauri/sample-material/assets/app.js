(function () {
  "use strict";

  var stage = document.getElementById("material");
  var steps = Array.prototype.slice.call(document.querySelectorAll("#steps li"));
  var playButton = document.getElementById("play");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");
  var statusText = document.getElementById("status");

  var STEP_DELAY_MS = 1600;
  var index = -1;
  var timer = null;
  var running = true;
  var completed = false;
  var configured = false;
  var announceTimer = null;
  var announceCount = 0;

  function post(type, body) {
    window.parent.postMessage(
      Object.assign({ ifp: 1, type: type }, body || {}),
      "*"
    );
  }

  // Pesan pada awal pemuatan iframe lintas-origin bisa hilang sebelum induk
  // sempat memasang listener. Ulangi `ready` sampai induk menjawab `config`,
  // dan jawab `hello` dari induk dengan `ready` lagi.
  function announce() {
    post("ready");
    if (index >= 0) {
      post("progress", { value: (index + 1) / steps.length });
    }
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

  function show(indexToShow) {
    index = indexToShow;
    stage.setAttribute("data-stage", String(index));
    steps.forEach(function (item, position) {
      if (position === index) {
        item.setAttribute("data-active", "true");
      } else {
        item.removeAttribute("data-active");
      }
    });
    statusText.textContent = steps[index].textContent;
    post("progress", { value: (index + 1) / steps.length });
  }

  function advance() {
    if (index >= steps.length - 1) {
      stop();
      return;
    }
    show(index + 1);
  }

  function start() {
    if (index >= steps.length - 1) {
      show(0);
    }
    running = true;
    playButton.textContent = "Jeda";
    stop();
    timer = window.setInterval(advance, STEP_DELAY_MS);
    statusText.textContent = "Animasi berjalan. Gunakan tombol Jeda untuk menghentikan sementara.";
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  playButton.addEventListener("click", function () {
    if (running) {
      running = false;
      stop();
      playButton.textContent = "Lanjutkan";
      statusText.textContent = "Animasi dijeda.";
    } else {
      start();
    }
  });

  completeButton.addEventListener("click", function () {
    if (completed) {
      return;
    }
    completed = true;
    completeButton.disabled = true;
    completeButton.textContent = "Sudah ditandai";
    statusText.textContent = "Materi ditandai selesai.";
    post("complete");
  });

  exitButton.addEventListener("click", function () {
    post("request-exit");
  });

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.ifp !== 1) {
      return;
    }
    if (data.type === "hello") {
      startAnnouncing();
      return;
    }
    if (data.type !== "config") {
      return;
    }
    configured = true;
    stopAnnouncing();
    document.documentElement.setAttribute("data-theme", data.theme === "dark" ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-reduced-motion",
      data.reducedMotion ? "true" : "false"
    );
  });

  show(0);
  start();
  startAnnouncing();
})();
