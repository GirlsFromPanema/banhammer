"use strict";

const { GuildMember, MessageEmbed, WebhookClient } = require("discord.js");
const ms = require("moment");

// Database queries
const antiping = require("../models/Admin/antiping");

// Configs
const emojis = require("../../Controller/emojis/emojis");
const config = require("../../Controller/owners.json");
const owners = config.owner

const {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  Discord,
  ReactionUserManager,
} = require("discord.js");

module.exports.data = {
  name: "messageCreate",
  once: false,
};

/**
 * Handle the clients event.
 * @param {GuildMember} member The client that triggered the event.
 * @param {CommandInteraction} interaction The Command Interaciton
 */

module.exports.run = async (message) => {
  try {
    const hasEnabled = await antiping.findOne({ id: message.guild.id });
    if(!hasEnabled) return;
    if(message.author.bot) return;

    // If the author is the owner of the server, return
    const owner = await message.guild.fetchOwner();
    if(message.author.id === owner) return;

    // If user has a higher / or the same role, return
    if (message.member.roles.highest.position >= message.guild.me.roles.highest.position) return;

    const embed = new MessageEmbed()
    .setTitle(`${emojis.notify} Warning`)
    .setDescription(`Dear ${message.author.username}, my owner doesn't like to get pinged.\nPlease, do not ping them, no matter what.\n\nYour timeout will be removed automatically after one hour.`)
    .setColor("RED")
    .setTimestamp()

    if(hasEnabled) {
      if (owners.some((word) => message.content.toLowerCase().includes(word))) {
        const member = message.guild.members.cache.get(message.author);
        const timeout = await message.member.timeout(3600000);
        message.channel.send({ content: `${emojis.notify} Ping\n**From:** ${message.author.tag}\n**Action:** Ping\n\n**Message:** ${message.content}` })
      }

      try {
        message.author.send({ embeds: [embed] })
      }catch(error) {
        message.channel.send({ content: "Could not send DM to User, DMs are closed." })
        console.log(error)
        return;
      }
      
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
