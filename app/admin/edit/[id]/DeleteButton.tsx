'use client'

import { deleteTool } from './actions'

export default function DeleteButton({ id }: { id: number }) {
  return (
    <form 
      action={deleteTool} 
      onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this tool? This cannot be undone.')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
        Delete Tool
      </button>
    </form>
  )
}