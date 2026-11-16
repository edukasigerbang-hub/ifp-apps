(function () {
  "use strict";

  var counter = document.getElementById("counter");
  var questionText = document.getElementById("question");
  var optionsBox = document.getElementById("options");
  var feedback = document.getElementById("feedback");
  var checkButton = document.getElementById("check");
  var nextButton = document.getElementById("next");
  var exitButton = document.getElementById("exit");

  // Edit bagian ini saja: satu entri untuk satu soal.
  var questions = [
    {
      text: "Air laut berubah menjadi awan melalui proses apa?",
      options: ["Penguapan", "Pembekuan", "Penyerapan tanah"],
      answer: 0,
    },
    {
      text: "Apa nama proses ketika uap air berubah menjadi titik air di awan?",
      options: ["Kondensasi", "Evaporasi", "Infiltrasi"],
      answer: 0,
    },
    {
      text: "Hujan yang turun ke tanah kemudian kembali ke laut melalui?",
      options: ["Sungai", "Gletser", "Lapisan udara"],
      answer: 0,
    },
  ];

  var configured = false;
  var announceTimer = null;
  var announceCount = 0;
  var index = 0;
  var checked = false;
  var correctCount = 0;

  function post(type, body) {
    window.parent.postMessage(
      Object.assign({ ifp: 1, type: type }, body || {}),
      "*"
    );
  }

  function progressValue() {
    return (index + (checked ? 1 : 0)) / questions.length;
  }

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

  function render() {
    var question = questions[index];
    counter.textContent = "Soal " + (index + 1) + " dari " + questions.length;
    questionText.textContent = question.text;
    optionsBox.textContent = "";
    checked = false;
    checkButton.disabled = false;
    nextButton.disabled = true;
    feedback.textContent = "Pilih satu jawaban, lalu tekan Periksa.";

    question.options.forEach(function (label, position) {
      var id = "option-" + position;
      var wrapper = document.createElement("div");
      wrapper.className = "quiz-option";

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.id = id;
      input.value = String(position);

      var text = document.createElement("label");
      text.htmlFor = id;
      text.textContent = label;

      wrapper.appendChild(input);
      wrapper.appendChild(text);
      optionsBox.appendChild(wrapper);
    });
  }

  function selected() {
    var chosen = optionsBox.querySelector("input:checked");
    return chosen ? Number(chosen.value) : -1;
  }

  checkButton.addEventListener("click", function () {
    var choice = selected();
    if (choice < 0) {
      feedback.textContent = "Pilih salah satu jawaban lebih dulu.";
      return;
    }
    checked = true;
    checkButton.disabled = true;
    nextButton.disabled = false;
    if (choice === questions[index].answer) {
      correctCount += 1;
      feedback.textContent = "Tepat. Jawaban Anda benar.";
    } else {
      feedback.textContent =
        "Belum tepat. Jawaban yang benar: " +
        questions[index].options[questions[index].answer] +
        ".";
    }
    post("progress", { value: progressValue() });
  });

  nextButton.addEventListener("click", function () {
    if (!checked) {
      return;
    }
    if (index + 1 < questions.length) {
      index += 1;
      render();
      post("progress", { value: progressValue() });
      return;
    }
    nextButton.disabled = true;
    feedback.textContent =
      "Selesai. Jawaban benar " + correctCount + " dari " + questions.length + ".";
    post("complete", { value: correctCount / questions.length });
  });

  exitButton.addEventListener("click", function () {
    post("request-exit");
  });

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

  render();
  startAnnouncing();
})();
