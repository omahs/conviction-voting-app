import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

const app = new Aragon()

app.store(
  async (state, { event, returnValues, blockNumber }) => {
    let nextState = { ...state }

    if (state == null) {
      nextState = {
        globalParams: {
          alpha: 90,
          funds: 15000,
          supply: 45000,
        },
        proposals: [],
        convictionStakes: [],
      }
    }

    if (event === events.SYNC_STATUS_SYNCING) {
      return { ...nextState, isSyncing: true }
    } else if (event === events.SYNC_STATUS_SYNCED) {
      return { ...nextState, isSyncing: false }
    }

    switch (event) {
      case 'ProposalAdded': {
        const { entity, id, title, amount, beneficiary } = returnValues
        const newProposal = {
          id,
          name: title,
          description: 'Lorem ipsum...',
          requestedToken: 'DAI', // token address?
          requestedAmount: parseInt(amount),
          creator: entity,
          beneficiary,
        }
        nextState.proposals.push(newProposal)
        break
      }
      case 'Staked':
      case 'Withdrawn': {
        const {
          entity,
          id,
          tokensStaked,
          totalTokensStaked,
          conviction,
        } = returnValues
        nextState.convictionStakes.push({
          event,
          entity,
          proposal: parseInt(id),
          tokensStaked: parseInt(tokensStaked),
          totalTokensStaked: parseInt(totalTokensStaked),
          time: blockNumber,
          conviction: parseInt(conviction),
        })
        break
      }
      default:
        nextState = state
    }

    console.log(nextState)
    return nextState
  },
  {
    init: null,
  }
)
