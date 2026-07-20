import { useParams } from 'react-router-dom'

function RepoDetailPage() {
  const { owner, name } = useParams()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {owner}/{name}
      </h1>
    </div>
  )
}

export default RepoDetailPage