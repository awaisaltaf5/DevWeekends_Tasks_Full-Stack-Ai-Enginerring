const Icons = {
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}

function Header() {
  const teamAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zidan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maura',
  ]

  return (
    <div className="header-card">
      <div className="header-text">
        <h1>Good Morning, Pristia!</h1>
        <p>What do you plan to do today?</p>
      </div>
      <div className="header-right">
        <div className="team-avatars">
          {teamAvatars.map((src, i) => (
            <img key={i} src={src} alt="Team" className="team-avatar" />
          ))}
        </div>
        <div className="team-info">
          <div className="team-name">Odama Studio</div>
          <div className="team-count">
            <Icons.users /> 1,354
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header