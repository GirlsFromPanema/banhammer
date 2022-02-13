"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const moment = require("moment");

module.exports.ownerOnly = {
  ownerOnly: true,
};

// Database queries
const Guild = require("../../models/Admin/antiping");

// Configs
const emojis = require("../../../Controller/emojis/emojis");
const config = require("../../../Controller/owners.json");

module.exports.cooldown = {
  length: 10000,
  users: new Set(),
};

/**
 * @param {CommandInteraction} interaction
 */

module.exports.run = async (interaction) => {
  await interaction.deferReply();
  const sub = interaction.options.getSubcommand();

  const disabled = new MessageEmbed()
    .setDescription(`${emojis.error} | Antiping is now **disabled**`)
    .setTimestamp()
    .setColor("RED");

  const enabled = new MessageEmbed()
    .setDescription(`${emojis.success} | Antiping is now **enabled**`)
    .setTimestamp()
    .setColor("GREEN");

  if (sub === "enable") {
    const hasEnabled = await Guild.findOne({ id: interaction.guild.id });
    if (!hasEnabled) {
      const newSetup = new Guild({
        id: interaction.guild.id,
      });
      newSetup.save();
      interaction.followUp({
        content: `${emojis.success} | Successfully **enabled** antiping`,
        ephemeral: true,
      });
    } else {
      interaction.followUp({
        content: `${emojis.error} | Already enabled antiping`,
        ephemeral: true,
      });
    }
  } else if (sub === "disable") {
    const hasEnabled = await Guild.findOne({ id: interaction.guild.id });
    if (!hasEnabled) {
      return interaction.followUp({
        content: `${emojis.error} | Antiping is not enabled.`,
        ephemeral: true,
      });
    }
    hasEnabled.delete();
    interaction.followUp({
      content: `${emojis.success} | Antiping is now **disabled**.`,
      ephemeral: true,
    });
  }
};

module.exports.data = new SlashCommandBuilder()
  .setName("antiping")
  .setDescription("Enable anti ping")
  .addSubcommand((sub) =>
    sub.setName("enable").setDescription("Enable your Account")
  )
  .addSubcommand((sub) =>
    sub.setName("disable").setDescription("Disable your Account")
  );
