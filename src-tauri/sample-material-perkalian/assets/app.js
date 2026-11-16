(function () {
  "use strict";

  var ORANGES_PER_GROUP = 4;
  var MAX_GROUPS = 4;
  var CORRECT_ANSWER = 6;
  var COMPLETE_GUARD_MS = 2000;

  var groupsEl = document.getElementById("groups");
  var emptyEl = document.getElementById("empty");
  var equationEl = document.getElementById("equation");
  var addButton = document.getElementById("add");
  var resetButton = document.getElementById("reset");
  var optionButtons = Array.prototype.slice.call(
    document.querySelectorAll("#options button")
  );
  var quizNote = document.getElementById("quiz-note");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");
  var statusText = document.getElementById("status");

  var groups = 0;
  var quizSolved = false;
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
    post("progress", { value: progressValue() });
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

  function progressValue() {
    var built = Math.min(1, groups / MAX_GROUPS) * 0.7;
    return Math.min(1, built + (quizSolved ? 0.3 : 0));
  }

  function sumSentence(count) {
    var parts = [];
    for (var i = 0; i < count; i += 1) {
      parts.push(String(ORANGES_PER_GROUP));
    }
    return parts.join(" + ");
  }

  function renderGroups() {
    groupsEl.textContent = "";
    for (var index = 0; index < groups; index += 1) {
      var card = document.createElement("div");
      card.className = "group";
      card.setAttribute("role", "listitem");
      card.setAttribute(
        "aria-label",
        "Kelompok " + (index + 1) + " berisi " + ORANGES_PER_GROUP + " jeruk"
      );
      for (var dot = 0; dot < ORANGES_PER_GROUP; dot += 1) {
        var orange = document.createElement("span");
        orange.className = "orange";
        orange.setAttribute("aria-hidden", "true");
        card.appendChild(orange);
      }
      var caption = document.createElement("span");
      caption.className = "count";
      caption.textContent = ORANGES_PER_GROUP + " jeruk";
      card.appendChild(caption);
      groupsEl.appendChild(card);
    }

    emptyEl.hidden = groups > 0;
    equationEl.textContent =
      groups === 0
        ? "0 × 4 = 0 jeruk"
        : groups +
          " × 4 = " +
          sumSentence(groups) +
          " = " +
          groups * ORANGES_PER_GROUP +
          " jeruk";
    addButton.disabled = groups >= MAX_GROUPS;
    post("progress", { value: progressValue() });
  }

  addButton.addEventListener("click", function () {
    if (groups >= MAX_GROUPS) {
      return;
    }
    groups += 1;
    renderGroups();
    statusText.textContent =
      groups + " kelompok × 4 jeruk = " + groups * ORANGES_PER_GROUP + " jeruk.";
    if (groups >= MAX_GROUPS) {
      statusText.textContent +=
        " Empat kelompok sudah cukup untuk melihat polanya.";
    }
  });

  resetButton.addEventListener("click", function () {
    groups = 0;
    quizSolved = false;
    optionButtons.forEach(function (button) {
      button.disabled = false;
      button.removeAttribute("data-state");
    });
    quizNote.textContent = "";
    renderGroups();
    statusText.textContent = "Susunan diulang dari awal.";
  });

  optionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (quizSolved) {
        return;
      }
      if (Number(button.dataset.answer) === CORRECT_ANSWER) {
        quizSolved = true;
        optionButtons.forEach(function (item) {
          item.disabled = true;
          if (item === button) {
            item.setAttribute("data-state", "correct");
          }
        });
        quizNote.textContent = "Benar! 2 × 3 = 3 + 3 = 6.";
        statusText.textContent = "Jawaban benar: 2 × 3 = 6.";
      } else {
        button.setAttribute("data-state", "wrong");
        quizNote.textContent =
          "Belum tepat. Hitung 3 + 3 sekali lagi, lalu pilih jawaban lain.";
        statusText.textContent = "Jawaban belum tepat.";
      }
      post("progress", { value: progressValue() });
    });
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
    document.documentElement.setAttribute(
      "data-theme",
      data.theme === "dark" ? "dark" : "light"
    );
    document.documentElement.setAttribute(
      "data-reduced-motion",
      data.reducedMotion ? "true" : "false"
    );
  });

  renderGroups();
  startAnnouncing();

  // Penampil mengabaikan `complete` sebelum ambang tinggal (minDwellSeconds),
  // jadi tombol baru aktif setelah ambang itu lewat.
  window.setTimeout(function () {
    if (completed) {
      return;
    }
    completeButton.disabled = false;
  }, COMPLETE_GUARD_MS);
})();
