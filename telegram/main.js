import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import readline from "readline";
import dotenv from "dotenv";
import { NewMessage } from "telegram/events/index.js";
import { NewMessageEvent } from "telegram/events/index.js";
import OllamaChat from "./ollama.js";
import OllamaTools from "./tools.js";
// import levelDatabase from "./db.js";

dotenv.config();

const chats = {};
// chats.general = new OllamaChat(process.env.HOST || 'http://127.0.0.1:11434', process.env.MODEL || 'unsloth_model');
chats.general = new OllamaChat(process.env.HOST || 'http://127.0.0.1:11434', process.env.MODEL || 'ollama', OllamaTools.tools);
chats.general.setSystemMessage(process.env.SYSTEM_MESSAGE || "");
const debug = process.env.DEBUG;


const apiId = +process.env.APP_ID;
const apiHash = process.env.APP_HASH;
if (!apiId) {
	throw new Error('API_ID not found!');
}
const stringSession = new StringSession(process.env.SESSION); // fill this later with the value from session.save()

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});



export default async function run() {
	console.log("Loading ...");
	const client = new TelegramClient(stringSession, apiId, apiHash, {
		connectionRetries: 5,
	});
	if (process.env.SESSION) {
		console.log("connectiong...");
		await client.connect();
		console.log("Connected successfully");
		let resMe = await client.getMe();
		console.log({ firstName: resMe.firstName });
	}
	else {
		await client.start({
			phoneNumber: async () =>
				new Promise((resolve) =>
					rl.question("Please enter your number: ", resolve)
				),
			password: async () =>
				new Promise((resolve) =>
					rl.question("Please enter your password: ", resolve)
				),
			phoneCode: async () =>
				new Promise((resolve) =>
					rl.question("Please enter the code you received: ", resolve)
				),
			onError: (err) => console.log(err),
		});
		console.log("You should now be connected.");
		console.log("Save this string to avoid logging in again:");
		console.log(client.session.save());
		console.log("Put this string to env.SESSION");
		await client.sendMessage("me", { message: "Hello!" });
	}

	const allDialogs = await client.getDialogs();
	const users = {};

	async function handler(event) {
		const eventt = new NewMessageEvent(event);
		console.log(eventt.message.message.peerId.className)
		console.log(eventt.message.message.message)
		if (
			//eventt.message.message.peerId.className == 'PeerUser' && 
			eventt.message.message.message) {
			let userId = eventt.message.message.peerId.chatId?.value || eventt.message.message.peerId.userId?.value;
			// await client.sendChatAction(userId, 'typing');
			if (!users[userId]) {
				await client.getDialogs();
				// chats[userId] = new OllamaChat(process.env.HOST || 'http://127.0.0.1:11434', process.env.MODEL || 'unsloth_model');
				chats[userId] = new OllamaChat(process.env.HOST || 'http://127.0.0.1:11434', process.env.MODEL || 'llama3.1', OllamaTools.tools);
				chats[userId].setSystemMessage(process.env.SYSTEM_MESSAGE || "");
				users[userId] = 1;
			}
			let message = eventt.message.message.message;
			let isCommand = false;

			let modelChatId = process.env.SEPERATE_MODEL_CHATS == 'true' ? userId : 'general';

			if (message.startsWith('/000')) {
				message = message.replace('/000', '/');
				isCommand = true;
				let res = await runCommand(modelChatId, message);
				await client.sendMessage(userId, { message: res || 'not returned' });
			}

			if (!isCommand) {
				let response = await chats[modelChatId].chatWithModel(JSON.stringify({
					userId,
					isChannel: eventt.message.message.isChannel,
					isGroup: eventt.message.message.isGroup,
					isPrivate: eventt.message.message.isPrivate,
					msgId: eventt.message.message.id,
					className: eventt.message.message.peerId.className,
					message
				}, (key, value) =>
					typeof value === 'bigint'
						? value.toString()
						: value
				));
				if (!response) {
					return;
				}
				await client.markAsRead(userId, eventt.message.message.id);
				await client.invoke(new Api.messages.SetTyping({
					peer: userId,
					action: new Api.SendMessageTypingAction()
				}));
				setTimeout(() => {
					client.invoke(new Api.messages.SetTyping({
						peer: userId,
						action: new Api.SendMessageTypingAction()
					}));
				}, 700);

				// await client.invoke(new Api.messages.SendReaction({
				// 	peer: userId,
				// 	reaction: [new Api.ReactionEmoji({ emoticon: {
				// 		heart: '❤️',
				// 		like: '👍'
				// 	}[Math.random() > 0.5 ? 'heart' : 'like'] })],
				// 	msgId: eventt.message.message.id
				// }));

				console.log({ res: JSON.stringify(response) });
				setTimeout(() => {
					client.sendMessage(userId, { message: response.content });
				}, 2000);

				// chat.setHistoryMessage( chatHistory ); // Is this need? chat history have system messages!
			}
		}
	}
	client.addEventHandler(handler, new NewMessage({}));
}

async function runCommand(userId, rawMessage) {
	let command = rawMessage.split(' ')[0];
	let textMessage = rawMessage.replace(command + ' ', '');
	switch (command) {
		case '/setPrompt':
			return setPrompt(userId, textMessage);
		case '/reset':
			return resetMessages(userId, textMessage);
		case '/help':
			return help();
		case '/getModels':
			return getModels(userId);
		case '/setModel':
			return setModel(userId, textMessage);
		case '/getPrompt':
			return getPrompt(userId);
		default:
			return 'command not found. send /help'
	}
}

function getChatHistory() {
	// let chatHistory = await client.getMessages( eventt.message._chatPeer, {
	// 	limit: 20, // Fetch last 20 messages
	// 	reverse: false // Oldest messages first
	// });
	// chatHistory = chatHistory.map( chat => { return { role: chat.message } || ""; });
	// if ( !users[eventt.message.message.peerId.userId.value] )
	// {
	// 	users[eventt.message.message.peerId.userId.value] = chatHistory;
	// }
	// chat.setHistoryMessage( chatHistory );
}

function help() {
	return `
	/reset
	to clear all messagese history and start again

	/setPrompt [prompt]
	to set new prompt + reset

	/getPrompt
	to get prompt

	/getModels
	to get models list

	/setModel [modelName]
	to set model
	`;
}

async function resetMessages(userId) {
	chats[userId].resetMessages();
	return 'OK';
}
async function setPrompt(userId, prompt) {
	chats[userId].resetMessages();
	chats[userId].setSystemMessage(prompt);
	return 'OK';
}
async function getModels(userId) {
	let models = await chats[userId].getModels();
	if (models) {
		return JSON.stringify(models, null, 4);
	}
	return 'null';
}
async function setModel(userId, modelTxt) {
	chats[userId].setModel(modelTxt);
	return 'OK';
}
async function getPrompt(userId) {
	return chats[userId].getSystemMessage();
}
