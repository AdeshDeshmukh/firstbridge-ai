import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'

const MODEL_DB_NAME = 'mediapipe-model-db'
const MODEL_STORE_NAME = 'models'
const MODEL_KEY = 'face_landmarker.task'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MODEL_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(MODEL_STORE_NAME)) {
        db.createObjectStore(MODEL_STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get model from IndexedDB cache or fetch and store if missing
 */
export async function getModelBlob(onProgress?: (progress: number) => void): Promise<Blob> {
  try {
    const db = await openDB()
    const transaction = db.transaction(MODEL_STORE_NAME, 'readonly')
    const store = transaction.objectStore(MODEL_STORE_NAME)

    const cached = await new Promise<Blob | undefined>((resolve, reject) => {
      const getReq = store.get(MODEL_KEY)
      getReq.onsuccess = () => resolve(getReq.result)
      getReq.onerror = () => reject(getReq.error)
    })

    if (cached) {
      console.log('[MediaPipe Loader] Loaded model from IndexedDB cache')
      if (onProgress) onProgress(100)
      return cached
    }
  } catch (err) {
    console.warn('[MediaPipe Loader] IndexedDB cache unavailable, falling back to network fetch:', err)
  }

  // Fetch model with progress reporting
  console.log('[MediaPipe Loader] Model not in cache. Fetching from CDN...')
  const response = await fetch(MODEL_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch model from ${MODEL_URL}`)
  }

  const contentLength = response.headers.get('content-length')
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body reader is unavailable')
  }

  const chunks: Uint8Array[] = []
  let loadedBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    if (value) {
      chunks.push(value)
      loadedBytes += value.length
      if (totalBytes > 0 && onProgress) {
        const percent = Math.round((loadedBytes / totalBytes) * 100)
        onProgress(percent)
      }
    }
  }

  const blob = new Blob(chunks as any)

  // Store in cache asynchronously
  try {
    const db = await openDB()
    const transaction = db.transaction(MODEL_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(MODEL_STORE_NAME)
    store.put(blob, MODEL_KEY)
    console.log('[MediaPipe Loader] Saved model to IndexedDB cache')
  } catch (err) {
    console.warn('[MediaPipe Loader] Failed to cache model:', err)
  }

  return blob
}

/**
 * Initialize FaceLandmarker instance using cached model blob and JSDelivr WASM fileset
 */
export async function initializeFaceLandmarker(
  modelBlob: Blob,
  canvasElement?: HTMLCanvasElement
): Promise<FaceLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  const modelAssetBuffer = new Uint8Array(await modelBlob.arrayBuffer())

  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetBuffer,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  })

  return landmarker
}
