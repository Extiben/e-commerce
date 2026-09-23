import { readFile } from 'node:fs/promises'
import path from 'node:path'

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' }

/** Sirve las imágenes subidas desde el panel de administración */
export async function GET(_: Request, ctx: RouteContext<'/media/[...path]'>) {
  const { path: parts } = await ctx.params
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || 'uploads')
  const file = path.resolve(/*turbopackIgnore: true*/ root, ...parts)
  if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 })
  const type = TYPES[path.extname(file).toLowerCase()]
  if (!type) return new Response('Not found', { status: 404 })
  try {
    const data = await readFile(file)
    return new Response(data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } })
  } catch { return new Response('Not found', { status: 404 }) }
}
