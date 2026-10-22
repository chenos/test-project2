import type { AppResource } from './en-US.js';
import systemZhCN from './system/zh-CN.js';

const zhCN: AppResource = {
  // The template's own copy; see `./en-US.ts`.
  ...systemZhCN,
  navigation: { ...systemZhCN.navigation, hello: '你好' },
  hello: { title: 'Hello', description: '欢迎来到 Hello 页面。' },
};

export default zhCN;
