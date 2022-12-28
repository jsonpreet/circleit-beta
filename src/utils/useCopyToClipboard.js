
import { useState } from 'react'


function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null)

  const copy = async (text) => {
    if (!navigator?.clipboard) {
      console.warn('[Copy to Clipboard Not Supported]')
      return false
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      setCopiedText(null)
      console.error('[Error Copy to Clipboard]', error)
      return false
    }
  }

  return [copy, copiedText]
}

export default useCopyToClipboard