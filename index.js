const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");

const logFilePath = "activityMonitor.log";

const getProcessInfoCommand = () => {
  if (os.platform() === "win32") {
    return "powershell \"Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + ' ' + $_.CPU + ' ' + $_.WorkingSet }\"";
  } else {
    return 'ps -e -o %cpu,%mem,comm --sort=-%cpu | head -n 2 | awk \'{print $1 " " $2 " " $3}\'';
  }
};

const updateTopProcess = () => {
  exec(getProcessInfoCommand(), (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing command: ${err}`);
      return;
    }

    const processInfo = stdout.trim();
    process.stdout.write(`\r${processInfo}`);

    const timestamp = Math.floor(Date.now() / 1000);
    const logMessage = `${timestamp} : ${processInfo}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error(`Error writing to log file: ${err}`);
      }
    });
  });
};

setInterval(updateTopProcess, 100);

setInterval(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  const logMessage = `${timestamp} : Log snapshot\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
}, 60000);
