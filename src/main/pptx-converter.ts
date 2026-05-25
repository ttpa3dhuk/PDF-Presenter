import { spawn } from 'node:child_process'
import { mkdir, rename, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, parse } from 'node:path'
import { app } from 'electron'

const SOFFICE_PATHS = [
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  '/usr/local/bin/soffice',
  '/opt/homebrew/bin/soffice',
]

let cachedSofficePath: string | null | undefined = undefined

function whichSoffice(): Promise<string | null> {
  return new Promise((resolve) => {
    const proc = spawn('which', ['soffice'])
    let out = ''
    proc.stdout.on('data', (d) => (out += String(d)))
    proc.on('error', () => resolve(null))
    proc.on('close', (code) => {
      if (code === 0 && out.trim()) resolve(out.trim())
      else resolve(null)
    })
  })
}

export async function findSoffice(): Promise<string | null> {
  if (cachedSofficePath !== undefined) return cachedSofficePath
  for (const candidate of SOFFICE_PATHS) {
    if (existsSync(candidate)) {
      cachedSofficePath = candidate
      return candidate
    }
  }
  const fromPath = await whichSoffice()
  cachedSofficePath = fromPath
  return fromPath
}

function cacheDir(): string {
  return join(app.getPath('userData'), 'pptx-cache')
}

export function cachedPdfPathFor(sha1: string): string {
  return join(cacheDir(), `${sha1}.pdf`)
}

export function cachedPdfExists(sha1: string): boolean {
  return existsSync(cachedPdfPathFor(sha1))
}

export async function convertPptxToPdf(pptxPath: string, sourceSha1: string): Promise<string> {
  const target = cachedPdfPathFor(sourceSha1)
  if (existsSync(target)) return target

  const soffice = await findSoffice()
  if (!soffice) {
    throw new Error(
      'LibreOffice не установлен. Установи: brew install --cask libreoffice (или скачай с libreoffice.org)',
    )
  }

  await mkdir(cacheDir(), { recursive: true })
  const tmpDir = join(cacheDir(), `tmp-${sourceSha1}-${Date.now()}`)
  await mkdir(tmpDir, { recursive: true })

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(soffice, [
        '--headless',
        '--norestore',
        '--nologo',
        '--nofirststartwizard',
        '--convert-to',
        'pdf',
        '--outdir',
        tmpDir,
        pptxPath,
      ])
      let stderr = ''
      proc.stderr.on('data', (d) => (stderr += String(d)))
      proc.on('error', (err) => reject(err))
      proc.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`LibreOffice exit ${code}: ${stderr.trim() || 'unknown error'}`))
      })
    })

    const parsed = parse(pptxPath)
    const generated = join(tmpDir, `${parsed.name}.pdf`)
    if (!existsSync(generated)) {
      throw new Error('LibreOffice не создал PDF (возможно, файл повреждён)')
    }
    await rename(generated, target)
    return target
  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
