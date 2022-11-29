import React, { useEffect } from 'react'
import { BsSun, BsMoon } from 'react-icons/bs'
import useApp from '../../store/app'

function ThemeSwitch() {
  const { theme, setTheme } = useApp((state) => state)

  const updateTheme = (theme) => {
    setTheme(theme)
  }

  useEffect(() => {
    const rootElement = document.documentElement
    const list = rootElement.classList
    if (theme === 'dark') {
      list.remove('light')
    } else {
      list.remove('dark')
    }
    list.add(theme)
  }, [theme])
  return (
    <>
      {(theme === 'dark') ?
        <button className='heading w-6 h-6' onClick={() => updateTheme('light')}>
          <BsSun size={22} />
        </button>
        :
        <button className='heading w-6 h-6' onClick={() => updateTheme('dark')}>
          <BsMoon size={24} />
        </button>
      }
    </>
  )
}

export default ThemeSwitch