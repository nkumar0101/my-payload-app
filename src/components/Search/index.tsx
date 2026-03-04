'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { SearchIcon, XIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams?.get('q') || '')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep input in sync if URL param changes externally (e.g. category click clears q)
  useEffect(() => {
    setValue(searchParams?.get('q') || '')
  }, [searchParams])

  function updateUrl(query: string) {
    const newParams = new URLSearchParams(searchParams.toString())
    if (query) {
      newParams.set('q', query)
    } else {
      newParams.delete('q')
    }
    router.push(createUrl('/shop', newParams))
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value
    setValue(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => updateUrl(query), 300)
  }

  function onClear() {
    setValue('')
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    updateUrl('')
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    updateUrl(value)
  }

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <div className="absolute left-0 top-0 ml-3 flex h-full items-center pointer-events-none">
        <SearchIcon className="h-4 text-neutral-500" />
      </div>
      <input
        autoComplete="off"
        className="w-full rounded-lg border bg-white pl-9 pr-9 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400"
        name="search"
        onChange={onChange}
        placeholder="Search for products..."
        type="text"
        value={value}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-0 top-0 mr-3 flex h-full items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <XIcon className="h-4" />
        </button>
      )}
    </form>
  )
}
