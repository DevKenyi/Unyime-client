import api from '../api/axios'

interface UploadSignature {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
}

/**
 * Uploads a file straight to Cloudinary using a short-lived signature from our backend
 * (POST /api/host/uploads/signature) — the file never round-trips through our own server.
 */
export async function uploadImage(file: File): Promise<string> {
  const { data: sig } = await api.post<UploadSignature>('/api/host/uploads/signature')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sig.apiKey)
  formData.append('timestamp', String(sig.timestamp))
  formData.append('signature', sig.signature)
  formData.append('folder', sig.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Image upload failed')
  }
  return json.secure_url as string
}
