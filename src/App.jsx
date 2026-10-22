import { useRoute } from './lib/router'
import DemoBanner from './components/DemoBanner'
import TabBar from './components/TabBar'
import TodayScreen from './screens/TodayScreen'
import PantryScreen from './screens/PantryScreen'
import ReceiptsScreen from './screens/ReceiptsScreen'
import HouseholdScreen from './screens/HouseholdScreen'
import './App.css'

function Screen({ route }) {
  const [, section, id] = route.split('/')
  switch (section) {
    case 'despensa':
      return <PantryScreen />
    case 'tickets':
      return <ReceiptsScreen purchaseId={id} />
    case 'hogar':
      return <HouseholdScreen />
    default:
      return <TodayScreen />
  }
}

export default function App() {
  const route = useRoute()

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">FeedMe</a>
      </header>
      <DemoBanner />
      <main className="main">
        <Screen route={route} />
      </main>
      <TabBar route={route} />
    </div>
  )
}
