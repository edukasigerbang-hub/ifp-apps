(function () {
  "use strict";

  var COMPLETE_GUARD_MS = 2000;

  var STATEMENTS = [
    {
      text: "Air membeku pada suhu 0 derajat Celsius.",
      answer: "fakta",
      why: "Suhu beku air dapat diukur dan diperiksa siapa pun."
    },
    {
      text: "Es krim rasa cokelat paling enak di dunia.",
      answer: "opini",
      why: "Rasa enak berbeda bagi setiap orang, jadi ini pendapat."
    },
    {
      text: "Indonesia memiliki lebih dari 17.000 pulau.",
      answer: "fakta",
      why: "Jumlah pulau bisa dihitung dan dicek datanya."
    },
    {
      text: "Hujan sore ini terasa sangat menyenangkan.",
      answer: "opini",
      why: "“Menyenangkan” adalah perasaan penulis, bukan data."
    },
    {
      text: "Kucing termasuk hewan mamalia.",
      answer: "fakta",
      why: "Ciri mamalia pada kucing dapat diamati dan diperiksa."
    },
    {
      text: "Membaca buku lebih seru daripada bermain bola.",
      answer: "opini",
      why: "“Lebih seru” adalah penilaian pribadi, bukan kenyataan umum."
    }
  ];

  var cardEl = document.getElementById("card");
  var counterEl = document.getElementById("counter");
  var totalEl = document.getElementById("total");
  var statementEl = document.getElementById("statement");
  var choicesEl = document.getElementById("choices");
  var choiceButtons = Array.prototype.slice.call(choicesEl.querySelectorAll("button"));
  var feedbackEl = document.getElementById("feedback");
  var nextButton = document.getElementById("next");
  var restartButton = document.getElementById("restart");
  var summaryEl = document.getElementById("summary");
  var summaryTitle = document.getElementById("summary-title");
  var scoreEl = document.getElementById("score");
  var summaryNote = document.getElementById("summary-note");
  var completeButton = document.getElementById("complete");
  var exitButton = document.getElementById("exit");
  var statusText = document.getElementById("status");
  var hintEl = document.getElementById("hint");

  var index = 0;
  var answered = 0;
  var correct = 0;
  var locked = false;
  var finished = false;
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
    return Math.min(1, answered / STATEMENTS.length);
  }

  function renderQuestion(moveFocus) {
    var item = STATEMENTS[index];
    finished = false;
    locked = false;
    // Judul kartu sudah memuat "Pernyataan N dari M"; hanya isi span yang diubah
    // agar elemen penghitung tidak terlepas dari dokumen.
    counterEl.textContent = String(index + 1);
    totalEl.textContent = String(STATEMENTS.length);
    cardEl.hidden = false;
    statementEl.textContent = item.text;
    feedbackEl.textContent = "";
    choicesEl.hidden = false;
    hintEl.hidden = false;
    nextButton.hidden = true;
    nextButton.textContent = index === STATEMENTS.length - 1 ? "Lihat hasil" : "Lanjut";
    summaryEl.hidden = true;
    choiceButtons.forEach(function (button) {
      button.disabled = false;
      button.removeAttribute("data-state");
    });
    if (moveFocus) {
      statementEl.focus();
    }
    post("progress", { value: progressValue() });
  }

  function renderSummary() {
    finished = true;
    cardEl.hidden = true;
    summaryEl.hidden = false;
    scoreEl.textContent = correct + " dari " + STATEMENTS.length + " benar";
    summaryNote.textContent =
      correct === STATEMENTS.length
        ? "Semua pernyataan dipilah dengan tepat."
        : "Periksa lagi pernyataan yang masih keliru dengan menekan Ulangi.";
    summaryTitle.focus();
    statusText.textContent = "Latihan selesai: " + correct + " dari " + STATEMENTS.length + " benar.";
    post("progress", { value: 1 });
  }

  function answer(picked) {
    if (locked || finished) {
      return;
    }
    var item = STATEMENTS[index];
    var isCorrect = picked === item.answer;
    locked = true;
    answered += 1;
    if (isCorrect) {
      correct += 1;
    }

    choiceButtons.forEach(function (button) {
      button.disabled = true;
      if (button.dataset.kind === item.answer) {
        button.setAttribute("data-state", "correct");
      } else if (button.dataset.kind === picked) {
        button.setAttribute("data-state", "wrong");
      }
    });

    feedbackEl.textContent = (isCorrect ? "Tepat. " : "Belum tepat. ") + item.why;
    nextButton.hidden = false;
    statusText.textContent =
      (isCorrect ? "Jawaban benar. " : "Jawaban belum tepat. ") + item.why;
    post("progress", { value: progressValue() });
  }

  choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      answer(button.dataset.kind);
    });
  });

  nextButton.addEventListener("click", function () {
    if (index >= STATEMENTS.length - 1) {
      renderSummary();
      return;
    }
    index += 1;
    renderQuestion(true);
  });

  restartButton.addEventListener("click", function () {
    index = 0;
    answered = 0;
    correct = 0;
    renderQuestion(true);
    statusText.textContent = "Latihan dimulai ulang.";
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

  totalEl.textContent = String(STATEMENTS.length);
  renderQuestion();
  startAnnouncing();

  // Penampil mengabaikan `complete` sebelum ambang tinggal (minDwellSeconds),
  // jadi tombol baru aktif setelah ambang itu lewat.
  window.setTimeout(function () {
    if (completed) {
      return;
    }
    completeButton.disabled = false;
  }, COMPLETE_GUARD_MS);

  // `card` hanya dipakai pembaca layar sebagai penanda bagian aktif.
  cardEl.setAttribute("data-step", "question");
})();
