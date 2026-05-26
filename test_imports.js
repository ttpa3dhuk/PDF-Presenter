// Try various approaches to get the real electron module
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);

// Try electron/main subpath
try {
  const e = req('electron/main');
  console.log("electron/main type:", typeof e);
} catch(err) { console.log("electron/main err:", err.message); }

// Check process bindings
console.log("process.type:", process.type);
console.log("process.versions.electron:", process.versions.electron);

process.exit(0);
