import './App.css'
import TransactionFeed from './Feed'
import { FeedProvider } from './contexts/FeedContext'
import { UIProvider } from './contexts/UIContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'

function App() {
  return (
    <FeedProvider>
      <UIProvider>
        <AnalyticsProvider>
          <TransactionFeed />
        </AnalyticsProvider>
      </UIProvider>
    </FeedProvider>
  )
}

export default App
