import { app, BrowserWindow, ipcMain } from "electron";
import { ChatCompletionRequestMessage } from "openai";
import { ChatGPT } from "../../chatgpt";
import { handleInputIfAlias, handleInputIfCommand } from "./command";
import { SizeDetector } from "./size";

const defaultCallback = (data: string) => {
  process.stdout.write(data);
};

const chat = new ChatGPT({
  apiKey:
    process.env.OPENAI_API_KEY ??
    require("fs")
      .readFileSync(
        require("path").join(require("os").homedir(), "./.chatrc"),
        "utf-8"
      )
      .split("OPENAI_API_KEY=")[1]
      .trim(),
  streamCallback: defaultCallback,
});

export const registerMainWinEvents = (
  win: BrowserWindow,
  size: SizeDetector
) => {
  let showFullHeight = false;

  win.on("closed", () => {
    win.close();
  });

  win.on("blur", () => {
    win.hide();
    if (process.platform === "darwin") {
      app.dock.hide();
    }
  });

  win.on("show", () => {
    win.webContents.send("show", null);
  });

  ipcMain.on("handshake", (event, arg) => {
    event.sender.send("handshake", { messages: chat.messages });
  });

  ipcMain.on("message", async (event, input: string) => {
    if (!showFullHeight) {
      showFullHeight = true;
      win.setSize(size.width, size.fullHeight);
    }

    const [isCommand, command] = handleInputIfCommand(input);

    if (isCommand) {
      event.sender.send("reply", {
        content: `执行指令 ${command?.command}: ${command?.tip}`,
      });
      command?.handler?.({
        win,
        chat,
        callback: () => {
          event.sender.send("clear", null);
          event.sender.send("reply-end", null);
          showFullHeight = false;
          win.setSize(size.width, size.height);
        },
      });

      console.info(chat.messages);
    } else {
      input = handleInputIfAlias(input);

      chat.setStreamCallback((content: string) => {
        // defaultCallback(content);
        event.sender.send("reply", { content });
      });

      await chat.sendMessage(input);

      // 回复消息给渲染进程
      event.sender.send("reply-end", null);
      chat.setStreamCallback(defaultCallback);
    }
  });
};
