(function () {
  "use strict";

  var stage = document.getElementById("material");
  var steps = Array.prototype.slice.call(document.querySelectorAll("#steps li"));
  var statusText = document.getElementById("status");
  var previousButton = document.getElementById("previous");
  var nextButton = document.getElementById("next");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");

  var index = 0;
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
  // memasang listener. Ulangi `ready` sampai induk menjawab `config`.
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

  function show(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    stage.setAttribute("data-stage", String(index));
    steps.forEach(function (item, position) {
      if (position === index) {
        item.setAttribute("data-active", "true");
      } else {
        item.removeAttribute("data-active");
      }
    });
    previousButton.disabled = index === 0;
    nextButton.disabled = index === steps.length - 1;
    statusText.textContent =
      "Langkah " + (index + 1) + " dari " + steps.length + ".";
    post("progress", { value: (index + 1) / steps.length });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.ifp !== 1) {
      return;
    }
    if (data.type === "config") {
      configured = true;
      stopAnnouncing();
      return;
    }
    if (data.type === "hello") {
      announce();
    }
  });

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

  show(0);
  startAnnouncing();
})();
