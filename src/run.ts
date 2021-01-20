// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";
import { Log } from "./log";
import * as child from "child_process";
import * as os from "os";
import { SIGINT } from "constants";
import { getRelativeDirectory, doesContainSpaces } from "./target";

const NoSpaceInPath = `
    The cmd path / include path / watch directory contains a space.

    Please use a cmd / include path / watch directory with no space in it.
`;

export interface ProcessOutput {
  pid: number;

  killed: boolean;
}

export function isWindows(): boolean {
  return os.platform() === "win32";
}

export function validateCmd(relativeCmd: string, args: string[]): boolean {
  let validated = true;
  if (isWindows()) {
    if (doesContainSpaces(relativeCmd)) {
      Log.warning(`${NoSpaceInPath}: ${relativeCmd}`);
      validated = false;
    }
  }
  if (validated) {
    for (const arg of args) {
      if (doesContainSpaces(arg)) {
        Log.warning(`${NoSpaceInPath}: ${arg}`);
        validated = false;
        break;
      }
    }
  }
  return validated;
}

export async function Run(
  cmd: string,
  args: string[],
  cwd: string
): Promise<string> {
  const relativeCmd = getRelativeDirectory(cwd, cmd);
  let output = "";
  if (!validateCmd(relativeCmd, args)) {
    throw new Error(NoSpaceInPath);
  }
  const prefix = `Run: Cwd: ${cwd}. Exec: ${relativeCmd} ${args.join("  ")}`;
  const prc = child.spawn(relativeCmd, args, {
    cwd: cwd,
    shell: false,
    windowsHide: true,
  });
  if (prc.killed) {
    Log.warning(`${prefix} killed. pid - ${prc.pid}`);
    throw new Error(`${prefix} killed. pid - ${prc.pid}`);
  } else if (prc.pid === null || prc.pid === undefined) {
    Log.warning(
      `${prefix} did not launch correctly. pid is null / undefined - ${prc.pid}`
    );
    throw new Error(
      `${prefix} did not launch correctly. pid is null / undefined - ${prc.pid}`
    );
  } else {
    Log.debug(`${prefix} launched with pid ${prc.pid}`);
  }
  prc.stdout.setEncoding("utf8");
  prc.stdout.on("data", (data: any) => {
    Log.debug(`${data}`);
    output = data;
  });
  prc.stderr.setEncoding("utf8");
  prc.stderr.on("data", (data: any) => {
    Log.debug(`stderr: ${data}`);
  });
  const execPromise = new Promise<string>((resolve, reject) => {
    prc.on("exit", (code: any) => {
      if (code === 0) {
        resolve(removeLineBreaks(output));
      } else {
        reject(`Process exited with code: ${code}`);
      }
    });
  });
  return await execPromise;
}

export async function RunDetached(
  cmd: string,
  cwd: string,
  args: string[]
): Promise<ProcessOutput> {
  const relativeCmd = getRelativeDirectory(cwd, cmd);
  Log.debug(
    `RunDetached: Cwd: ${cwd}. Exec: ${relativeCmd} ${args.join("  ")}`
  );
  if (!validateCmd(relativeCmd, args)) {
    throw new Error(NoSpaceInPath);
  }
  const prc = child.spawn(relativeCmd, args, {
    cwd: cwd,
    detached: true,
    stdio: "ignore",
    shell: false,
    windowsHide: true,
  });
  prc.unref(); // Parent should not be waiting for the child process at all
  if (prc.killed) {
    Log.warning(`Detached Process ${cmd} killed. pid - ${prc.pid}`);
    throw new Error(`Detached Process ${cmd} killed. pid - ${prc.pid}`);
  } else if (prc.pid === null || prc.pid === undefined) {
    Log.warning(
      `Detached process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`
    );
    throw new Error(
      `Detached process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`
    );
  } else {
    Log.debug(`Detached process ${cmd} launched with pid ${prc.pid}`);
  }
  if (prc.stdout) {
    prc.stdout.setEncoding("utf8");
    prc.stdout.on("data", (data: any) => {
      Log.debug(`Output: ${data}`);
    });
  }
  if (prc.stderr) {
    prc.stderr.setEncoding("utf8");
    prc.stderr.on("data", (data: any) => {
      Log.debug(`stderr: ${data}`);
    });
  }
  const processOutput: ProcessOutput = {
    pid: prc.pid,
    killed: prc.killed,
  };
  return processOutput;
}

export function removeLineBreaks(value: string): string {
  return value.replace(/(\r\n|\n|\r)/gm, "");
}

export function killProcess(pid: number) {
  if (!isWindows()) {
    process.kill(-pid, SIGINT);
  } else {
    // windows does not kill processes apparently.
    const spawn = require("child_process").spawn;
    const cmd = spawn("taskkill", ["/pid", pid, "/f", "/t"]);
    cmd.on("exit", (data: any) => {
      Log.debug(`${data}`);
    });
  }
}

export function getWatcherPattern(
  sourceDirectory: string,
  ext: string
): string {
  if (isWindows()) {
    return sourceDirectory + "/**/*." + ext;
  } else {
    return sourceDirectory + "/**/*." + ext;
  }
}
