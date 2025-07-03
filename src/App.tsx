import './App.css'
import TransactionFeed from './Feed'
import SettingsMenu from './components/SettingsMenu'
import AnalyticsToggle from './components/AnalyticsToggle'
import { FeedProvider } from './contexts/FeedContext'
import { UIProvider } from './contexts/UIContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'

function App() {
  return (
    <FeedProvider>
      <UIProvider>
        <AnalyticsProvider>
          <SettingsMenu />
          <AnalyticsToggle />
          <TransactionFeed />
        </AnalyticsProvider>
      </UIProvider>
    </FeedProvider>
  )
}

export default App
