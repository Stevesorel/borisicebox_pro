import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

export function useTheme() {
  const themeStore = useThemeStore()

  const isDark = computed(() => themeStore.theme === 'dark')
  const isLight = computed(() => themeStore.theme === 'light')
  const currentTheme = computed(() => themeStore.theme)

  const toggle = () => themeStore.toggleTheme()
  const setTheme = (mode) => {
    if (mode === 'dark' || mode === 'light') {
      themeStore.theme = mode
    }
  }

  return {
    isDark,
    isLight,
    currentTheme,
    toggle,
    setTheme,
  }
}