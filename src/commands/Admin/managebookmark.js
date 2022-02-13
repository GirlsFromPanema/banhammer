"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const moment = require("moment");

// Database queries
const Bookmark = require("../../models/Admin/bookmarkchannel");

// Configs
const emojis = require("../../../Controller/emojis/emojis");
const config = require("../../../Controller/owners.json");

module.exports.cooldown = {
  length: 10000,
  users: new Set(),
};

module.exports.ownerOnly = {
  ownerOnly: true,
};

/**
 * @param {CommandInteraction} interaction
 */

module.exports.run = async (interaction) => {
  await interaction.deferReply();
  const sub = interaction.options.getSubcommand();

  const channel =
    interaction.options.getChannel("channel") || interaction.channel;

  if (sub === "setup") {
    const hasEnabled = await Bookmark.findOne({ id: interaction.guild.id });
    if (!hasEnabled) {
      if (channel.type != "GUILD_TEXT") {
        interaction.followUp({
          content: `${emojis.error} | This is not a valid channel!`,
          ephemeral: true,
        });
        return;
      }
      const newBm = new Bookmark({
        id: interaction.guild.id,
        channel: channel.id,
      })
      newBm.save();

      interaction.followUp({ content: `${emojis.success} | Done.`, ephemeral: true });
    } else {
        await Bookmark.findOneAndUpdate({
            id: interaction.guild.id,
            channel: channel.id
        })
        interaction.followUp({ content: `${emojis.success} | Changed to ${channel}.`, ephemeral: true });
    }
  } else if (sub === "unregister") {
    const hasEnabled = await Bookmark.findOne({ id: interaction.guild.id });
    if(!hasEnabled) return interaction.followUp({ content: `${emojis.error} | No setup found to remove.`, ephemeral: true });
  }
};

module.exports.data = new SlashCommandBuilder()
  .setName("managebookmark")
  .setDescription("Manage your bookmark logs")
  .addSubcommand((sub) =>
    sub
      .setName("setup")
      .setDescription("Setup bookmark")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select the channel for sending bm messages")
          .setRequired(false)
      )
  )

  .addSubcommand((sub) =>
    sub.setName("remove").setDescription("Remove bookmark")
  );
