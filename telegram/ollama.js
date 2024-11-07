import { Ollama } from "ollama";

export default class OllamaChat
{
	constructor ( host = "http://127.0.0.1:11434", model = "llama3.1:8b" )
	{
		this.ollama = new Ollama({ host });
		this.model = model;
		this.messages = [];
	}

	setSystemMessage ( systemMessage )
	{
		if ( this.messages.length > 0 && this.messages[0].role === "system" )
		{
			this.messages[0].content = systemMessage;
		}
		else
		{
			this.messages.unshift({ role: "system", content: systemMessage });
		}
	}

	getSystemMessage ()
	{
		if ( this.messages.length > 0 && this.messages[0].role === "system" )
		{
			return this.messages[0].content;
		}
		else
		{
			return "null";
		}
	}

	// Add a user message to the conversation
	addUserMessage ( content )
	{
		this.messages.push({ role: "user", content });
	}

	// Add the model's response to the conversation
	addModelMessage ( message )
	{
		this.messages.push( message );
	}

	resetMessages ()
	{
		this.messages = [this.messages[0]]; // Keep the system message
	}

	getModels ()
	{
		return this.ollama.list();
	}

	setModel ( modelTxt )
	{
		this.model = modelTxt;
	}
	setHistoryMessage ( conversation )
	{
		const systemMessage = this.messages.length > 0 ? [this.messages[0]] : [];
		this.messages = [...systemMessage, ...conversation];
	}

	// Function to send a chat request to the model
	async sendMessage ()
	{
		try
		{
			const response = await this.ollama.chat({
				model: this.model,
				messages: this.messages,
			});

			// Add the model's message to the conversation history
			this.addModelMessage( response.message );

			return response.message;
		}
		catch ( error )
		{
			console.error( "Error during chat:", error );
			return null;
		}
	}

	// High-level function to handle conversations
	async chatWithModel ( content = null, systemMessage = null )
	{
		// Set or update the system message if provided
		if ( systemMessage )
		{
			this.setSystemMessage( systemMessage );
		}

		// If there's a user message, add it to the conversation
		if ( content )
		{
			this.addUserMessage( content );
		}

		// Send the message and return the model's response
		const response = await this.sendMessage();
		return response;
	}
}