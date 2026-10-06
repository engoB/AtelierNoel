const PHOTO_SIZE = 512

export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Choisis une photo de moins de 12 Mo.')
  const source = await loadImageSource(file)
  const canvas = document.createElement('canvas')
  canvas.width = PHOTO_SIZE
  canvas.height = PHOTO_SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Cette photo ne peut pas être préparée.')

  const side = Math.min(source.width, source.height)
  const sourceX = (source.width - side) / 2
  const sourceY = (source.height - side) / 2
  context.drawImage(source.image, sourceX, sourceY, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE)
  source.close?.()
  return canvas.toDataURL('image/webp', 0.82)
}

async function loadImageSource(file: File): Promise<{ image: CanvasImageSource; width: number; height: number; close?: () => void }> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return { image, width: image.naturalWidth, height: image.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}
