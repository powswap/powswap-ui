import { useWeb3React } from '@web3-react/core'
import { BaseVariant } from 'featureFlags'
import { useRedesignFlag } from 'featureFlags/flags/redesign'
import { useEffect } from 'react'
import { useDarkModeManager } from 'state/user/hooks'

const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
  backgroundBlendMode: '',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
  backgroundBlendMode: '',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient')
const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundRadialGradientElement) {
      backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })
export default function RadialGradientByChainUpdater(): null {
  const { chainId } = useWeb3React()
  const [darkMode] = useDarkModeManager()
  const redesignFlag = useRedesignFlag()
  const redesignFlagEnabled = redesignFlag === BaseVariant.Enabled
  // manage background color
  useEffect(() => {
    if (!backgroundRadialGradientElement) {
      return
    }

    switch (chainId) {
      default:
        setBackground(initialStyles)
        const defaultLightGradient = redesignFlagEnabled
          ? 'radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0.51) 0%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
          : 'radial-gradient(50% 50% at 50% 50%,#fc077d10 0,rgba(255,255,255,0) 100%)'
        const defaultDarkGradient = redesignFlagEnabled
          ? 'linear-gradient(180deg, #202738 0%, #070816 100%)'
          : 'radial-gradient(50% 50% at 50% 50%,#203e39 0,rgba(255,255,255,0) 100%)'
        backgroundRadialGradientElement.style.background = darkMode ? defaultDarkGradient : defaultLightGradient
        backgroundRadialGradientElement.style.backgroundBlendMode = redesignFlagEnabled
          ? 'none'
          : darkMode
          ? 'overlay,normal'
          : 'multiply,normal'
    }
  }, [darkMode, chainId, redesignFlagEnabled])
  return null
}
