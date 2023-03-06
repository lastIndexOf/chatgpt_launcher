# ChatGPT-Client

用了几天ChatGPT辅助编程发现效率比谷歌高，但是一直开终端和浏览器太麻烦了，所以花了一晚上写了这个简单的工具（没咋写过 electron，全程借助 ChatGPT 辅助）

- 安装后，使用快捷键 `command+shift+space` 打开客户端
- 由于 openai 的 api 上下文有最大 tokens 限制，超过限制后会直接报400，所以提供了命令清除 context，直接在输入框输入`:clear`（英文），敲回车即可

## 基础能力

在 `~/.chatrc` 下声明自己的 openai api key

```json
OPENAI_API_KEY=sk-xxxxxxx
```

![基础能力](./assets/demo-base.gif)

## 设置别名

在 `~/.chat/.alias.json` 下声明别名列表即可，具体的别名可以参考[ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts),中文参考[ChatGPT Prompts 中文版](https://github.com/PlexPt/awesome-chatgpt-prompts-zh)

```json
{
  "Helo": "你好"
}
```

![配置别名](./assets/demo-alias.gif)
