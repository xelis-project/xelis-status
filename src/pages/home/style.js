import { css } from 'goober'
import theme from 'xelis-explorer/src/style/theme'

export default {
  header: {
    container: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 2em 0 3em 0;
      gap: 1em;
    `,
    logo: css`
      width: 3em;
      height: 3em;
      display: block;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: ${theme.apply({ xelis: `url('public/img/white_background_black_logo.svg')`, light: `url('public/img/black_background_white_logo.svg')`, dark: `url('public/img/white_background_black_logo.svg')`, })};
    `,
    title: css`
      font-size: 2.5em;
      font-weight: bold;
    `,
    description: css`
      max-width: 27em;
      text-align: center;
      opacity: .9;
    `
  },
  statusList: {
    title: css`
      font-size: 2em;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: .25em;
    `,
    description: css`
      margin-bottom: 1em;
      color: var(--muted-color);
    `,
    items: css`
    display: flex;
    gap: 1em;
    flex-direction: column;
    `
  },
  statusItem: {
    container: css`
      display: flex;
      gap: 1em;
      justify-content: space-between;
      align-items: center;

      background-color: ${theme.apply({ xelis: `rgb(0 0 0 / 50%)`, dark: `rgb(0 0 0 / 50%)`, light: `rgb(255 255 255 / 50%)` })};
      padding: 1em;
      border-radius: .5em;
    `,
    containerWithNodeInfo: css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `,
    title: css`
      font-size: 1.2em;
      margin-bottom: .5em;
      display: flex;
      gap: .5em;
    `,
    latency: css`
      display: flex;
      gap: 1em;
      flex-direction: row;
      align-items: center;
    `,
    dot: {
      container: css`
        min-width: 1.1em;
        min-height: 1.1em;
        max-width: 1.1em;
        max-height: 1.1em;
        border-radius: 50%;
      `,
      dead: css`background-color: red;`,
      slow: css`background-color: yellow;`,
      slower: css`background-color: orange;`,
      best: css`background-color: green;`,
      init: css`background-color: gray;`
    },
    nodeInfo: css`
      padding: 1em;
      background: rgb(0 0 0 / 30%);
      border-bottom-right-radius: .5em;
      border-bottom-left-radius: .5em;
    `
  },
  nodeInfo: {
    container: css`
      display: flex;
      gap: 1em;
      flex-direction: column;
      justify-content: space-between;

      ${theme.query.minDesktop} {
        flex-direction: row;
      }
    `,
    item: {
      container: css`
        display: flex;
        gap: .5em;
        flex-direction: column;
      `,
      title: css`
        opacity: .5;
        white-space: nowrap;
      `,
      value: css`
        word-break: break-all;
      `
    }
  }
}
