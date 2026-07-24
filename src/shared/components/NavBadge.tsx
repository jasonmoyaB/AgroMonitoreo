export function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}
