import { createContext, useContext, useState, type ReactNode, useCallback } from 'react'

interface FullscreenParamContextValue {
  /** 注册一个参数面板渲染函数（ParameterPanel mount 时自动调用） */
  registerPanel: (render: () => ReactNode, title?: string) => void
  /** 注销 */
  unregisterPanel: () => void
  /** 当前注册的面板 */
  panel: { render: () => ReactNode; title?: string } | null
}

const FullscreenParamContext = createContext<FullscreenParamContextValue>({
  registerPanel: () => {},
  unregisterPanel: () => {},
  panel: null,
})

export function FullscreenParamProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<{ render: () => ReactNode; title?: string } | null>(null)

  const registerPanel = useCallback((render: () => ReactNode, title?: string) => {
    setPanel({ render, title })
  }, [])

  const unregisterPanel = useCallback(() => {
    setPanel(null)
  }, [])

  return (
    <FullscreenParamContext.Provider value={{ registerPanel, unregisterPanel, panel }}>
      {children}
    </FullscreenParamContext.Provider>
  )
}

export function useFullscreenParam() {
  return useContext(FullscreenParamContext)
}
