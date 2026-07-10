import { ref, watch } from 'vue'

const LANGUAGE_STORAGE_KEY = 'admin-language'
const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
const language = ref(storedLanguage === 'th' ? 'th' : 'en')

watch(language, (value) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, value)
  document.documentElement.lang = value
}, { immediate: true })

export function useLanguage() {
  const toggleLanguage = () => {
    language.value = language.value === 'en' ? 'th' : 'en'
  }

  return { language, toggleLanguage }
}
