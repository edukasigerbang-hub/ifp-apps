import { basename } from "node:path";
import { validatePackageDirectory } from "./lib/validatePackageDirectory";

const rootArg = process.argv[2] ?? "content/fixtures/valid-package";

validatePackageDirectory(rootArg)
  .then((report) => {
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== "VALID") {
      process.exitCode = 1;
    }
  })
  .catch((error: unknown) => {
    console.error(`Gagal memvalidasi ${basename(rootArg)}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  });
