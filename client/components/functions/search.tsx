import { Input } from "@/components/ui/input"

interface SearchProps {
  onSearch: (query: string) => void
}

export function Search({ onSearch }: SearchProps) {
  return (
    <div className="max-w-md w-full">
      <Input
        type="search"
        placeholder="Search for concerts..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full"
      />
    </div>
  )
}
