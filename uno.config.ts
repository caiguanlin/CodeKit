import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  theme: {
    colors: {
      primary: '#10b981', // 现代化翠绿/极客青翠，与参考站呼应
      primaryHover: '#059669',
      darkBg: '#121214',
      darkCard: '#1a1a1e',
      darkBorder: '#27272a'
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'app-border': 'border border-solid border-[#27272a] dark:border-[#27272a]',
    'icon-btn': 'p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-gray-100 flex items-center justify-center'
  }
})
