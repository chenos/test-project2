import type { AppResource } from './en-US.js';
import systemZhCN from './system/zh-CN.js';

const zhCN: AppResource = {
  // The template's own copy; see `./en-US.ts`.
  ...systemZhCN,
  navigation: { ...systemZhCN.navigation, hello: '你好', hello3: 'Hello3' },
  hello: { title: 'Hello', description: '欢迎来到 Hello 页面。' },
  hello3: { title: 'Hello3', description: '欢迎来到 Hello3 页面。' },
};

export default zhCN;
