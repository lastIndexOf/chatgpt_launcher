#!/usr/bin/env node

import { createInterface, Interface } from "readline";
import { ChatGPT } from "../chatgpt";

const question = (
  rl: Interface,
  opts: {
    label: string;
  }
): Promise<string> =>
  new Promise((resolve) => {
    rl.question(opts.label, (answer) => {
      resolve(answer);
    });
  });

async function main() {
  const chat = new ChatGPT({
    apiKey: process.env.OPENAI_API_KEY!,
    streamCallback: (data: string) => {
      process.stdout.write(data);
    },
  });

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let input: string = "";
  while (true) {
    input = await question(rl, { label: "请输入您的问题: " });
    await chat.sendMessage(input);

    if (input === "quit") {
      break;
    }
  }

  rl.close();
}

main();
