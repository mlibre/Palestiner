
export default class OllamaTools
{
	constructor ( functions )
	{
		this.functions = functions;
	}
	static tools = [{
		type: "function",
		function: {
			"name": "send_message",
			"description": "response a message, allways should call this tool! one call and put full response in text parameter",
			"parameters": {
				"type": "object",
				"properties": {
					"text": {
						"type": "string",
						"description": "full response",
					},
				},
				"required": ["text"],
			}
		}
	}];
	runTool = async ( tool ) =>
	{
		console.log({ tool });
	};
}