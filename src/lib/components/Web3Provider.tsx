import { SetStateAction } from 'jotai'
import { RESET, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { connectorAtom, injectedAtom, networkAtom } from 'lib/state'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { initializeConnector, Web3ReactHooks } from 'widgets-web3-react/core'
import { EIP1193 } from 'widgets-web3-react/eip1193'
import { Network } from 'widgets-web3-react/network'
import { Actions, Connector, Provider as EthProvider } from 'widgets-web3-react/types'

interface Web3ProviderProps {
  jsonRpcEndpoint?: string
  provider?: EthProvider
  children: ReactNode
}

function useConnector<T extends { new (actions: Actions, initializer: I): Connector }, I>(
  Connector: T,
  initializer: I | undefined,
  setConnector: (update: typeof RESET | SetStateAction<[Connector, Web3ReactHooks]>) => void
) {
  return useEffect(() => {
    if (initializer) {
      const [connector, hooks] = initializeConnector((actions) => new Connector(actions, initializer))
      setConnector([connector, hooks])
    } else {
      setConnector(RESET)
    }
  }, [Connector, initializer, setConnector])
}

export default function Web3Provider({ jsonRpcEndpoint, provider, children }: Web3ProviderProps) {
  const setNetwork = useUpdateAtom(networkAtom)
  // TODO(zzmp): Network should take a string, not a urlMap.
  const urlMap = useMemo(() => jsonRpcEndpoint && { 1: jsonRpcEndpoint }, [jsonRpcEndpoint])
  useConnector(Network, urlMap, setNetwork)

  const setInjected = useUpdateAtom(injectedAtom)
  useConnector(EIP1193, provider, setInjected)

  // TODO(zzmp): zustand does not support swapping stores;
  // see https://github.com/pmndrs/zustand/issues/721#issuecomment-999983109
  const [key, setKey] = useState(0)
  const connector = useAtomValue(connectorAtom)
  useEffect(() => {
    setKey((key) => ++key)
  }, [connector])

  return <div key={key}>{children}</div>
}
