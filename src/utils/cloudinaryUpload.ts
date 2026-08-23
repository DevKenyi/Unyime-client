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
 * (POST /api/host/uploads/signature, /api/guest/uploads/signature for a guest session, or
 * /api/public/uploads/signature for the no-login booking flow) — the file never round-trips
 * through our own server. context picks the destination folder on Cloudinary's side (e.g.
 * property photos vs KYC docs).
 */
export async function uploadImage(
  file: File,
  context: 'properties' | 'kyc' = 'properties',
  signatureEndpoint: '/api/host/uploads/signature' | '/api/guest/uploads/signature' | '/api/public/uploads/signature' = '/api/host/uploads/signature'
): Promise<string> {
  const { data: sig } = await api.post<UploadSignature>(`${signatureEndpoint}?context=${context}`)

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
