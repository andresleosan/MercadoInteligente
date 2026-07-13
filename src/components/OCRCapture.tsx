import { useRef, type ChangeEvent } from 'react'

interface Props {
  onImageSelected: (file: File) => void
}

export default function OCRCapture({ onImageSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImageSelected(file)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar por foto</h2>
      <p className="text-sm text-gray-600 mb-4">
        Tomá una foto del ticket o subí una imagen de la galería.
      </p>
      <label htmlFor="ocr-capture-file" className="block">
        <span className="sr-only">Foto del ticket</span>
        <input
          ref={inputRef}
          id="ocr-capture-file"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-green-600 file:text-white
            hover:file:bg-green-700 file:cursor-pointer"
        />
      </label>
    </div>
  )
}
