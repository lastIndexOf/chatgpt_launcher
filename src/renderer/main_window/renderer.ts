import { ipcRenderer, webContents } from 'electron';
import { avatar } from './components/avatar';

import './assets/normalize.css';
import './assets/search.css';
import { mkRender } from '../features/markdown';

interface IMessage {
  id: string;
  question: string;
  answer: string;
}

class Searcher {
  private root: HTMLInputElement;
  private QAContainer: HTMLInputElement;
  private _messages: IMessage[] = [];
  private _onSearch?: () => void;
  private _locked = false;

  constructor(opts: {
    root: string;
    QAContainer: string;
    onSearch?: () => void;
  }) {
    this.root = document.querySelector(opts.root)!;
    this.QAContainer = document.querySelector(opts.QAContainer)!;

    if (!this.root) {
      throw new Error(`${opts.root} is not a dom root`);
    }
    if (!this.QAContainer) {
      throw new Error(`${opts.QAContainer} is not a dom root`);
    }

    this._onSearch = opts.onSearch ?? (() => -1);

    this._init();
  }

  private _init() {
    this._initDomEvents();
    this._initIpcEvents();
  }

  private _initDomEvents() {
    this.root?.addEventListener('input', this._handleInput);
    this.root?.addEventListener('keypress', this._handleKeyPress);
  }

  private _initIpcEvents() {
    ipcRenderer.on('show', () => {
      this.root.focus();
    });

    ipcRenderer.on('clear', () => {
      this._locked = true;
      // while (this.QAContainer.childNodes.length > 1) {
      //   // 当存在多余一个子元素时，持续删除
      //   this.QAContainer.removeChild(this.QAContainer.lastChild);
      // }
      this.QAContainer.innerHTML = '<section class="divider"></section>';

      this._messages = [];
      this._locked = false;
    });
  }

  private _handleInput = (e: Event) => {
    // console.info(e);
  };

  private _handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !this._locked) {
      this._sendMessageToMain();
    }
  };

  private _sendMessageToMain() {
    this.root!.disabled = true;
    this._locked = true;

    const question = this._input ?? '';

    if (!question) {
      return;
    }

    const message: IMessage = {
      id: `${Math.random().toString(36).slice(2)}`,
      question,
      answer: '',
    };

    const { answerDom } = this._calc(message);

    const replyEnd = (event: any, arg: any) => {
      console.log('reply: ', arg);
      this.root!.disabled = false;
      this.root!.value = '';
      this._locked = false;
      this.root!.focus();
      // console.info(this._messages);
      ipcRenderer.removeListener('reply', reply);
    };

    const reply = (event: any, { content }: { content: string }) => {
      message.answer += content;
      answerDom.innerHTML = mkRender.render(message.answer);
      this.QAContainer.scrollTop = this.QAContainer.scrollHeight;
    };

    ipcRenderer.send('message', question);
    ipcRenderer.addListener('reply', reply);
    ipcRenderer.once('reply-end', replyEnd);

    this._messages.push(message);
  }

  private _calc(message: { id: string; question: string; answer: string }) {
    const { id, question, answer } = message;

    const QAContainer = this.QAContainer;

    if (!QAContainer) {
      throw new Error('QAContainer is not a dom root');
    }

    const questionDom = document.createElement('li');
    questionDom.classList.add('gpt-question');
    questionDom.innerText = `🤡 ${question}`;

    const answerContainer = document.createElement('li');
    answerContainer.classList.add('answer-container');
    answerContainer.innerHTML = avatar;
    const answerDom = document.createElement('section');
    answerDom.classList.add('gpt-answer', 'markdown-body');
    answerDom.innerText = answer;

    const container = document.createElement('ul');
    container.id = id;
    container.classList.add('gpt-container');

    container.appendChild(questionDom);
    container.appendChild(answerContainer);
    answerContainer.appendChild(answerDom);

    QAContainer.appendChild(container);

    return {
      container,
      questionDom,
      answerDom,
    };
  }

  private get _input() {
    return this.root?.value;
  }
}

const searcher = new Searcher({ root: '.search', QAContainer: '.gpt-scroll' });

console.info(searcher);
