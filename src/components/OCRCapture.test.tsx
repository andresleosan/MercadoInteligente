import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OCRCapture from './OCRCapture'

describe('OCRCapture', () => {
  it('should render a file input accepting images', () => {
    render(<OCRCapture onImageSelected={vi.fn()} />)
    const input = screen.getByLabelText(/foto del ticket/i) as HTMLInputElement
    expect(input.type).toBe('file')
    expect(input.accept).toBe('image/*')
  })

  it('should call onImageSelected when a file is selected', () => {
    const onImageSelected = vi.fn()
    render(<OCRCapture onImageSelected={onImageSelected} />)

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/foto del ticket/i)
    fireEvent.change(input, { target: { files: [file] } })

    expect(onImageSelected).toHaveBeenCalledWith(file)
  })

  it('should not call onImageSelected if no file selected', () => {
    const onImageSelected = vi.fn()
    render(<OCRCapture onImageSelected={onImageSelected} />)

    const input = screen.getByLabelText(/foto del ticket/i)
    fireEvent.change(input, { target: { files: [] } })

    expect(onImageSelected).not.toHaveBeenCalled()
  })
})
