import Icon from './Icon'

const TABS = [
  { path: '/', label: 'Hoy', icon: 'today' },
  { path: '/despensa', label: 'Despensa', icon: 'pantry' },
  { path: '/tickets', label: 'Tickets', icon: 'receipt' },
  { path: '/hogar', label: 'Hogar', icon: 'home' },
]

export default function TabBar({ route }) {
  // Recipes live under "Hoy", the screen they feed.
  const segment = route.split('/')[1]
  const section = segment === 'recetas' ? '/' : '/' + segment
  return (
    <nav className="tabbar" aria-label="Secciones">
      {TABS.map((tab) => (
        <a key={tab.path} href={`#${tab.path}`} className="tab"
          aria-current={section === tab.path ? 'page' : undefined}>
          <Icon name={tab.icon} />
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  )
}
