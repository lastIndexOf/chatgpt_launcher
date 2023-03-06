import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";

interface IChatGPTOptions {
  apiKey: string;
  streamCallback?: (data: string) => void;
}

export class ChatGPT {
  private _messages: ChatCompletionRequestMessage[] = [];
  private _api?: OpenAIApi;
  private _streamCallback?: (data: string) => void;

  constructor(opts: IChatGPTOptions) {
    const { apiKey } = opts;

    this._streamCallback = opts.streamCallback;
    this._apiInit(apiKey);
  }

  private async _apiInit(apiKey: string) {
    const config = new Configuration({
      apiKey,
    });
    this._api = new OpenAIApi(config);
  }

  private handleStreamData(stream: any): Promise<ChatCompletionRequestMessage> {
    let reply: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "",
    };
    process.stdout.write("Answer: ");

    return new Promise((resolve, reject) => {
      stream
        .on("data", (data: Buffer) => {
          const text = data.toString();
          const messages = text.split("data:").filter(Boolean);

          messages.forEach((m: string) => {
            const trimmed = m.trim();

            if (trimmed === "[DONE]") {
              console.info();
              return resolve(reply);
            } else {
              const response = JSON.parse(trimmed);
              const { role, content } = response?.choices?.[0]?.delta ?? {};

              if (role) {
                reply.role = role;
              }
              if (content) {
                reply.content += content;
                this._streamCallback?.(content);
              }
            }
          });
        })
        .on("error", (err: Error) => {
          reject(err);
        });
    });
  }

  public get messages() {
    return this._messages;
  }

  public async sendMessage(message: string) {
    this._messages.push({
      role: "user",
      content: message,
    });

    const res = await this._api!.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: this._messages,
        n: 1,
        stream: true,
      },
      { responseType: "stream" }
    );

    const reply = await this.handleStreamData(res.data as any);

    this._messages.push(reply);

    return reply;
  }

  public setStreamCallback(streamCallback: (data: string) => void) {
    this._streamCallback = streamCallback;
  }

  public clear() {
    this._messages = [];
  }
}
