import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export default function userMessageTimestamp(pi: ExtensionAPI) {
	pi.on("context", (event) => {
		let messages: typeof event.messages | undefined;

		for (let index = 0; index < event.messages.length; index += 1) {
			const message = event.messages[index];
			let replacement = message;

			if (
				message.role === "user" &&
				typeof message.timestamp === "number" &&
				Number.isFinite(message.timestamp)
			) {
				let prefix: string | undefined;
				try {
					prefix = `<omp-message-metadata timestamp="${new Date(message.timestamp).toISOString()}"/>\n`;
				} catch {
					// Dates outside JavaScript's supported range are left untouched.
				}

				if (prefix !== undefined) {
					if (typeof message.content === "string") {
						if (!message.content.startsWith(prefix)) {
							replacement = {
								...message,
								content: `${prefix}${message.content}`,
							};
						}
					} else if (
						Array.isArray(message.content) &&
						!(
							message.content[0]?.type === "text" &&
							message.content[0].text === prefix
						)
					) {
						replacement = {
							...message,
							content: [{ type: "text", text: prefix }, ...message.content],
						};
					}
				}
			}

			if (replacement !== message && messages === undefined) {
				messages = event.messages.slice(0, index);
			}
			messages?.push(replacement);
		}

		return messages === undefined ? undefined : { messages };
	});
}
