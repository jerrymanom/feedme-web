// Receipts are read fine at ~1600px. Shrinking on the phone keeps uploads fast,
// stays under the API's 5 MB limit and lowers the cost of each scan.
export const MAX_SIDE = 1600

export function fitWithin(width, height, maxSide = MAX_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export async function fileToJpegBase64(file, { maxSide = MAX_SIDE, quality = 0.82 } = {}) {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  return { base64: dataUrl.slice(dataUrl.indexOf(',') + 1), mediaType: 'image/jpeg' }
}
