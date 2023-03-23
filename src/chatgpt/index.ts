import axios, { AxiosInstance } from 'axios';
import { ChatCompletionRequestMessage } from 'openai';
import { sleep } from '../utils/timer';

interface IChatGPTOptions {
  apiKey: string;
  streamCallback?: (data: string) => void;
}

export class ChatGPT {
  private _retries = 3;
  private _messages: ChatCompletionRequestMessage[] = [];
  private _api?: AxiosInstance;
  private _streamCallback?: (data: string) => void;

  constructor(opts: IChatGPTOptions) {
    const { apiKey } = opts;

    this._streamCallback = opts.streamCallback;
    this._apiInit(apiKey);
  }

  private async _apiInit(apiKey: string) {
    // const config = new Configuration({
    //   apiKey,
    // });
    this._api = axios.create({
      timeout: 3000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private handleStreamData(stream: any): Promise<ChatCompletionRequestMessage> {
    const reply: ChatCompletionRequestMessage = {
      role: 'assistant',
      content: '',
    };
    // process.stdout.write('Answer: ');

    return new Promise((resolve, reject) => {
      stream
        .on('data', (data: Buffer) => {
          const text = data.toString();
          const messages = text.split('data:').filter(Boolean);

          messages.forEach((m: string) => {
            const trimmed = m.trim();

            if (trimmed === '[DONE]') {
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
        .on('error', (err: Error) => {
          const msg = `Request ChatGPT Api Error: ${err.message}. please input \`:clear\` clear context.`;
          this._streamCallback?.(msg);
          resolve(reply);
        });
    });
  }

  public get messages() {
    return this._messages;
  }

  public async sendMessage(message: string) {
    this._messages.push({
      role: 'user',
      content: message,
    });

    let retry = 3;
    while (retry > 0) {
      try {
        const res = await this._api?.post(
          `https://api.openai.com/v1/chat/completions`,
          {
            model: 'gpt-3.5-turbo',
            messages: this._messages,
            n: 1,
            stream: true,
          },
          { responseType: 'stream' }
        );

        const reply = await this.handleStreamData(res.data as any);

        this._messages.push(reply);

        return reply;
      } catch (err) {
        console.error(err.toString());
        await sleep(500);
        retry--;
      }
    }

    const msg = `Request ChatGPT Api Error. please input \`:clear\` clear context.`;
    this._streamCallback?.(msg);
    return msg;
  }

  public setStreamCallback(streamCallback: (data: string) => void) {
    this._streamCallback = streamCallback;
  }

  public clear() {
    this._messages = [];
  }
}
