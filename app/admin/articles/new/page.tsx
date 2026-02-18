import { createArticle } from './actions'

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="type-title mb-8">Add New Article</h1>

      <form action={createArticle} className="space-y-6">
        <div>
          <label className="block type-caption">Title</label>
          <input
            name="title"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block type-caption">URL</label>
          <input
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block type-caption">Publisher</label>
            <input
              name="publisher"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block type-caption">Category</label>
            <input
              name="category"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>

        <div>
          <label className="block type-caption">Published At</label>
          <input
            name="published_at"
            type="datetime-local"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <button
          type="submit"
          className="type-body w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
        >
          Create Article
        </button>
      </form>
    </div>
  )
}
