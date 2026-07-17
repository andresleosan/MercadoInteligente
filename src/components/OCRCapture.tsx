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
    <div className="bg-surface rounded-radius-xl border border-border-subtle shadow-card p-6 text-center">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Registrar por foto</h2>
      <p className="text-sm text-text-secondary mb-4">
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
          className="block w-full text-sm text-text-muted
            file:mr-4 file:py-2 file:px-4
            file:rounded-radius-md file:border-0
            file:text-sm file:font-medium
            file:bg-accent-green file:text-white
            hover:file:brightness-110 file:cursor-pointer transition-fast"
        />
      </label>
    </div>
  )
}
