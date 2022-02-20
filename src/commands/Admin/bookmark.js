"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  CommandInteraction,
  Permissions,
  MessageEmbed,
  WebhookClient,
} = require("discord.js");

// Database query
const Bookmark = require("../../models/Admin/bookmark");
const Guild = require("../../models/Admin/bookmarkchannel");

// Configs
const emojis = require("../../../Controller/emojis/emojis");

module.exports.cooldown = {
  length: 10000 /* in ms */,
  users: new Set(),
};

module.exports.ownerOnly = {
  ownerOnly: true,
};

/**
 * Runs the command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
  try {
    const owner = interaction.user;
    const target = interaction.options.getMember("target");
    const reason = interaction.options.getString("reason");

    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    if (!guildQuery) return interaction.reply({ content: `${emojis.error} | No Bookmark Setup found.`, ephemeral: true });
    
    if (guildQuery) {
      const guild = interaction.client.guilds.cache.get(interaction.guild.id);
      const logging = guild.channels.cache.get(guildQuery.channel);
      logging.send({ embeds: [logs] });

      interaction.reply({
        content: `${emojis.success} | Successfully bookmarked ${target}`,
        ephemeral: true,
      });
    }

    if (!target)
      return interaction.followUp({
        content: `${emojis.error} | This User is invalid`,
        ephemeral: true,
      });

    const isBookmarked = await Bookmark.findOne({ userID: target.id });
    if (!isBookmarked) {
      const newUser = new Bookmark({
        userID: target.id,
        reason: reason,
      });
      newUser.save();
    } else {
      interaction.reply({
        content: `${emojis.error} | Already bookmarked user.`,
        ephemeral: true,
      });
    }

    const logs = new MessageEmbed()
      .setTitle("✅ | User bookmarked")
      .setDescription(
        `User: ${target.user.tag}\nModerator: ${interaction.user.tag}\nReason: ${reason}`
      )
      .setTimestamp()
      .setColor("RED");

    owner.send({ embeds: [logs] });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports.permissions = {
  clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
};

module.exports.data = new SlashCommandBuilder()
  .setName("bookmark")
  .setDescription("Bookmark a user")
  .addUserOption((option) =>
    option
      .setName("target")
      .setDescription("Select the User to bookmark")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Provide a Reason for Bookmark")
      .setRequired(true)
  );
