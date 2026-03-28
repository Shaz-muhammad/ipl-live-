import { spawn } from "node:child_process";

const frontend = spawn("npm", ["run", "dev", "-w", "frontend"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const backend = spawn("npm", ["run", "dev", "-w", "backend"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const onExit = (code, label) => {
  // eslint-disable-next-line no-console
  console.log(`[dev] ${label} exited with code ${code}`);
  process.exit(code ?? 0);
};

frontend.on("exit", (code) => onExit(code, "frontend"));
backend.on("exit", (code) => onExit(code, "backend"));

