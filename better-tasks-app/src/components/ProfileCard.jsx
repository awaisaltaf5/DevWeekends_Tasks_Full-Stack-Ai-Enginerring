function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-left">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Panda&backgroundColor=b6e3f4" 
          alt="Profile" 
          className="profile-avatar" 
        />
        <div className="profile-details">
          <h3>Nameless Pada #245</h3>
          <p>Microsoft</p>
        </div>
      </div>
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-label">Overall Impact Score</div>
          <div className="stat-value">-</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Ideal Session Length</div>
          <div className="stat-value">-</div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard