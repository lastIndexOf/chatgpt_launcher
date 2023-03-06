import { BrowserWindow } from "electron";
import { ChatGPT } from "../../chatgpt";

export enum Commands {
  Clear = "clear",
}

export interface ICommandHandlerParams {
  win: BrowserWindow;
  chat: ChatGPT;
  callback?: Function;
}

export interface ICommandHandler {
  tip: string;
  command: Commands;
  handler: (ctx: ICommandHandlerParams) => void;
}

export const CommandHandler: {
  [command in Commands]: ICommandHandler;
} = {
  [Commands.Clear]: {
    tip: "",
    command: Commands.Clear,
    handler: (ctx: ICommandHandlerParams) => {
      const { win, chat, callback } = ctx;
      chat.clear();
      win.webContents.send("clear", null);
      callback?.();
    },
  },
};

export const handleInputIfCommand = (
  input: string
): [
  boolean,
  {
    tip: string;
    command: Commands;
    handler: (ctx: ICommandHandlerParams) => void;
  } | null
] => {
  if (input.startsWith(":")) {
    const command: Commands = input.split(":")[1] as Commands;
    if (command in CommandHandler) {
      return [true, CommandHandler[command]];
    }
  }

  return [false, null];
};

export const handleInputIfAlias = (input: string): string => {
  if (input.startsWith("@")) {
    const alias = input.split("@")[1];
    let customAliasList: any = {};
    try {
      customAliasList = JSON.parse(
        require("fs").readFileSync(
          require("path").join(require("os").homedir(), "./.chat/.alias.json"),
          "utf-8"
        )
      );
    } catch (err) {
      customAliasList = {};
    }

    if (alias in customAliasList) {
      return customAliasList[alias];
    }
  }

  return input;
};
