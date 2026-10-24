import path from "node:path";
import { DatabaseSync } from "node:sqlite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function invoke(page, command, args = {}) {
  return page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke(${JSON.stringify(command)}, ${JSON.stringify(args)})
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
}

async function clickButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === ${JSON.stringify(label)});
      const target = buttons.find((button) => button.offsetParent !== null) ?? buttons[0];
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const profile = await invoke(page, "profile_get_active");
  assert(profile.ok, "Profil aktif tidak dapat dibaca.");
  const profileId = profile.value.id;

  const sessionId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const started = await invoke(page, "learning_start_session", {
    input: {
      sessionId,
      profileId,
      packageId: "matematika-kelas3-pecahan",
      packageVersion: "0.1.0",
      lessonId: "pecahan-sederhana",
      manifestHash: null
    }
  });
  assert(started.ok, `Sesi gagal dibuat: ${JSON.stringify(started.error)}`);

  const saved = await invoke(page, "learning_save_attempt", {
    input: {
      attemptId: crypto.randomUUID(),
      progressId: crypto.randomUUID(),
      outboxId: crypto.randomUUID(),
      eventId: crypto.randomUUID(),
      sessionId,
      activityId: "kuis-pecahan-sederhana",
      score: 100,
      occurredAt: startedAt,
      answers: [
        {
          responseId: crypto.randomUUID(),
          questionId: "soal-setengah",
          optionId: "opsi-setengah",
          responseText: null,
          isCorrect: true
        }
      ]
    }
  });
  assert(saved.ok, `Percobaan gagal disimpan: ${JSON.stringify(saved.error)}`);
  log("Data awal dibuat: 1 sesi, 1 percobaan, 1 respons, 1 outbox.");

  const backupPath = path.join(artifactDir, "ifp-backup.db");
  const exported = await invoke(page, "backup_export", { destination: backupPath });
  assert(exported.ok, `Backup gagal: ${JSON.stringify(exported.error)}`);
  assert(exported.value.counts.sessions === 1, "Backup tidak memuat 1 sesi.");
  assert(exported.value.counts.attempts === 1, "Backup tidak memuat 1 percobaan.");
  assert(exported.value.counts.outbox === 1, "Backup tidak memuat 1 event outbox.");
  assert(exported.value.bytes > 0, "Ukuran backup nol.");
  log(`Backup dibuat: ${exported.value.bytes} byte, SHA-256 ${exported.value.sha256.slice(0, 12)}…`);

  const inspected = await invoke(page, "backup_inspect", { path: backupPath });
  assert(inspected.ok, `Inspect backup gagal: ${JSON.stringify(inspected.error)}`);
  assert(inspected.value.sha256 === exported.value.sha256, "Hash inspect berbeda dari export.");
  assert(inspected.value.counts.profiles === exported.value.counts.profiles, "Jumlah profil berbeda.");
  log("Inspect backup: hash cocok dan jumlah data sama.");

  const extra = await invoke(page, "profile_create", {
    input: { displayName: "Setelah Backup", profileType: "student" }
  });
  assert(extra.ok, "Profil tambahan gagal dibuat.");
  const changed = await invoke(page, "profile_list");
  assert(changed.ok && changed.value.length === 2, "Mutasi pra-restore tidak terlihat.");
  log("Data dimutasi (2 profil) sebelum restore.");

  const restored = await invoke(page, "backup_restore", { path: backupPath });
  assert(restored.ok, `Restore gagal: ${JSON.stringify(restored.error)}`);
  assert(restored.value.counts.profiles === 1, "Setelah restore profil bukan 1.");
  assert(restored.value.counts.sessions === 1, "Setelah restore sesi bukan 1.");
  assert(restored.value.counts.attempts === 1, "Setelah restore percobaan bukan 1.");
  log("Restore mengembalikan 1 profil, 1 sesi, 1 percobaan.");

  const profilesAfter = await invoke(page, "profile_list");
  assert(
    profilesAfter.ok && profilesAfter.value.length === 1,
    `Profil setelah restore: ${profilesAfter.value?.length}`
  );
  const activeAfter = await invoke(page, "profile_get_active");
  assert(activeAfter.ok && activeAfter.value.id === profileId, "Profil aktif tidak dipulihkan.");
  const summary = await invoke(page, "learning_get_summary", { profileId });
  assert(summary.ok, "Ringkasan setelah restore gagal dibaca.");
  assert(summary.value.sessions === 1 && summary.value.attempts === 1, "Ringkasan tidak dipulihkan.");
  assert(summary.value.averageScore === 100, "Rata-rata skor tidak dipulihkan.");
  log("Profil aktif dan ringkasan belajar pulih.");

  const newerPath = path.join(artifactDir, "ifp-backup-newer.db");
  await page.evaluate(`
    window.__TAURI_INTERNALS__.invoke("backup_export", {
      destination: ${JSON.stringify(newerPath)}
    })
  `);
  const db = new DatabaseSync(newerPath);
  try {
    db.prepare(
      "INSERT OR REPLACE INTO schema_migrations (version, applied_at, checksum) VALUES (999, '2026-10-24T00:00:00Z', 'e2e')"
    ).run();
  } finally {
    db.close();
  }
  const rejected = await invoke(page, "backup_restore", { path: newerPath });
  assert(!rejected.ok, "Restore dari backup versi lebih baru seharusnya ditolak.");
  assert(
    rejected.error?.code === "BACKUP_SCHEMA_TOO_NEW",
    `Kode error: ${JSON.stringify(rejected.error)}`
  );
  const stillThere = await invoke(page, "profile_list");
  assert(stillThere.ok && stillThere.value.length === 1, "Data berubah setelah restore ditolak.");
  log("Backup dengan schema lebih baru ditolak (BACKUP_SCHEMA_TOO_NEW); data utuh.");

  await clickButton(page, "Hasil Belajar");
  await page.waitFor(`document.body.textContent.includes("Aktivitas terbaru")`, {
    label: "layar Hasil Belajar"
  });
  await page.waitFor(`document.body.textContent.includes("100")`, {
    label: "skor hasil setelah restore"
  });
  log("Hasil Belajar tetap menampilkan skor setelah restore.");

  await page.screenshot(path.join(artifactDir, "backup-restore.png"));
  log("Screenshot backup/restore tersimpan.");
}
