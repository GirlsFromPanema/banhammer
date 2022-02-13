'use strict'

/*

                                        ----- INFORMATION ----- INFORMATION ----- INFORMATION ----- INFORMATION ----- INFORMATION ----- INFORMATION 

                                                                            THIS IS THE TIME SYSTEM OF THE BOT.
                                                                                    MODIFY AT YOUR OWN RISK.

                                                                - THIS FILE IS ONLY NEEDED FOR INIT. THE TIME UTIL QUERIES.

                                     - SUPPORT IS NOT PROVIDED IF THIS IS MODIFIED/CHANGED/MOVED IN ANY WAY THAT MAY BREAK COMMANDS/EVENTS/FUNCTIONS.




                                                                                                                                                                                                                                                                                                                    */

/*



                                                                                %CopyrightBegin%


                                                                    Copyright Banhammer 2021. All Rights Reserved.

                                                            Licensed under the Apache License, Version 2.0 (the "License");
                                                            you may not use this file except in compliance with the License.

                                                                    You may obtain a copy of the License at

                                                                    http://www.apache.org/licenses/LICENSE-2.0

                                                            Unless required by applicable law or agreed to in writing, software
                                                            distributed under the License is distributed on an "AS IS" BASIS,
                                                        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                        See the License for the specific language governing permissions and
                                                                            limitations under the License.


                                                                                    %CopyrightEnd%    
                                                                                    
                                                                                    
                                                                                    
                                                                        --      last update: 13/2/2022         --                                                                                                                                                                                                       */

const { Permissions, CommandInteraction } = require('discord.js')
const { getKeyByValue, msToMinAndSec } = require('../util/util.js')
const { red } = require('colors/safe')


// Configs
const config = require('../../Controller/owners.json');
const emojis = require('../../Controller/emojis/emojis');

module.exports.data = {
	name: 'interactionCreate',
	once: false,
}

/**
 * Handle the clients interactionCreate event.
 * @param {CommandInteraction} interaction The interaction that triggered the event.
 */
module.exports.run = async (interaction) => {
	try {
	/* 
    
    Only handle command interactions.

    Return if the command does not exist or is not loaded / deployed.


    Add a cooldown to the user and return an error 
    */

		if (!interaction.isCommand()) return
		const command = interaction.commandName.toLowerCase()
		let cmdFile
		if (interaction.client.commands.has(command))
			cmdFile = interaction.client.commands.get(command)
		else return /* Return if command doesn't exist. */

		/* Check if command is on cooldown. */
		if (cmdFile.cooldown.users.has(interaction.member.id)) {
			await interaction.reply({
				content: `${
					emojis.error
				} | You can only use this command every ${msToMinAndSec(
					cmdFile.cooldown.length,
				)} minutes.`,
				ephemeral: true,
			})
			return
		}

		// if the user isnt within the owners, dont execute the cmd
		if (cmdFile.ownerOnly) {
			if (!config.owner.includes(interaction.user.id))
				return interaction.reply({
					content: `${emojis.error} | You are not the Owner of this Bot.`,
					ephemeral: true,
				})
		}

		/* Array containing all the missing permissions of the client/user to run the interaction. Ideally those arrays are empty. */
		let missingClientPermissions = [],
			missingUserPermissions = []

		/* Check if the client is missing any permissions. */
		cmdFile.permissions?.clientPermissions.forEach((flag) => {
			if (!interaction.guild.me.permissions.has(flag))
				missingClientPermissions.push(
					getKeyByValue(Permissions.FLAGS, flag),
				)
		})

		/* If the client is missing any permissions, don't run the command. */
		if (missingClientPermissions.length != 0) {
			await interaction.reply({
				content: `${
					emojis.error
				} | I am missing the following permissions.\n \`${missingClientPermissions.toString()}\``,
				ephemeral: true,
			})
			return
		}

		/* Check if the user is missing any permissions. */
		cmdFile.permissions?.userPermissions.forEach((flag) => {
			if (!interaction.member.permissions.has(flag))
				missingUserPermissions.push(
					getKeyByValue(Permissions.FLAGS, flag),
				)
		})

		const args = []

		for (let option of interaction.options.data) {
			if (option.type === 'SUB_COMMAND') {
				if (option.name) args.push(option.name)
				option.options?.forEach((x) => {
					if (x.value) args.push(x.value)
				})
			} else if (option.value) args.push(option.value)
		}

		/* Only run the command if the user is not missing any permissions. */
		if (missingUserPermissions.length == 0) {
			cmdFile
				.run(interaction, args)
				.catch((err) => console.error(red(err)))
			/* If user doesn't has Admin perms, add him a cooldown. */
			if (
				!interaction.member.permissions.has(
					Permissions.FLAGS.ADMINISTRATOR,
				)
			) {
				/* Add command cooldown */
				cmdFile.cooldown?.users.add(interaction.member.id)
				setTimeout(() => {
					cmdFile.cooldown?.users.delete(interaction.member.id)
				}, cmdFile.cooldown?.length)
			}
		} else
			await interaction.reply({
				content: `${
					emojis.error
				} | You are missing the following permissions.\n \`${missingUserPermissions.toString()}\``,
				ephemeral: true,
			})
	} catch (err) {
		console.error(red(err))
	}
}
