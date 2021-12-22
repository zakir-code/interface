import { createMulticall } from '@uniswap/redux-multicall'
import { atom, SetStateAction, WritableAtom } from 'jotai'
import { atomWithStore } from 'jotai/redux'
import { atomWithDefault, RESET } from 'jotai/utils'
import { createStore } from 'redux'
import { Web3ReactHooks } from 'widgets-web3-react/core'
import { initializeConnector } from 'widgets-web3-react/core'
import { Connector } from 'widgets-web3-react/types'

class EmptyConnector extends Connector {
  activate() {
    void 0
  }
}

type Web3Context = [Connector, Web3ReactHooks]

export const networkAtom = atomWithDefault<Web3Context>(() =>
  initializeConnector<Connector>((actions) => new EmptyConnector(actions))
)

export const injectedAtom = atomWithDefault<Web3Context | null>(() => null) as WritableAtom<
  Web3Context,
  typeof RESET | SetStateAction<Web3Context> // prevents updates to null outside of RESET
>

export const connectorAtom = atom((get) => {
  const injected = get(injectedAtom)
  return injected ? injected : get(networkAtom)
})

export const multicall = createMulticall()
const multicallStore = createStore(multicall.reducer)
export const multicallStoreAtom = atomWithStore(multicallStore)
