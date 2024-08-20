import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import RebloomLogo from './components/RebloomLogo'

const config: DocsThemeConfig = {
  logo: <RebloomLogo className="text-2xl" />,
  project: {
    link: 'https://github.com/shuding/nextra-docs-template',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  footer: {
    text: 'Nextra Docs Template',
  },
}

export default config
