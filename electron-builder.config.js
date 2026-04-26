module.exports = {
  appId: 'com.koukou.fastprint',
  productName: '扣扣快打',
  copyright: 'Copyright © 2024 扣扣快打',

  directories: {
    output: 'release',
    buildResources: 'build'
  },

  files: [
    'electron/**/*',
    'vite-dist/**/*',
    'package.json',
    '!node_modules/**/*',
    '!index.html'  // 排除根目录的 index.html，避免与 dist 中的冲突
  ],

  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg', 'zip'],
    arch: ['x64'],
    darkModeSupport: true,
    hardenedRuntime: false,
    gatekeeperAssess: false,
    icon: 'build/icons/icon.icns'
  },

  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },

  linux: {
    category: 'Utility',
    target: ['AppImage', 'deb'],
    icon: 'build/icon.png'
  },

  win: {
    target: ['nsis', 'portable'],
    icon: 'build/icons/icon.ico'
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },

  publish: null,

  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/'
  },

  nodeGypMirror: 'https://npmmirror.com/mirrors/node-gyp/'
}
