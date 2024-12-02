import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          <Link href="/">Concert Ticket Resell</Link>
        </h1>
      </div>
    </header>
  )
}