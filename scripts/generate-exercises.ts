/**
 * Genera ejercicios con Claude Code headless y los sube a Firestore.
 *
 * Por defecto NO escribe nada: genera, valida y muestra. Para escribir hace
 * falta pasar --write, y encima confirmar (o pasar --yes).
 *
 * Uso:
 *   npm run gen                     menu interactivo
 *   npm run gen:list                lista secciones y subtipos
 *   npm run gen -- --type articles  directo por bandera
 *
 * El .env se carga solo, no hace falta --env-file.
 *
 * Un documento por palabra en la colección `exercises`:
 *   exercises/prepositions__place-prepositions__at
 *   { section, subtype, word, exercises: [20 x Exercise], model, generatedAt }
 *
 * Requiere que las reglas de Firestore permitan escribir en `exercises`.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import type { Interface } from 'node:readline/promises'
import { initializeApp } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { getGroup, groups } from '../src/content/index.ts'
import type { Exercise } from '../src/types/exercise.ts'

const DEFAULT_COUNT = 20
// Id exacto y no el alias 'sonnet': el alias apunta al último Sonnet y se mueve
// solo, y este valor queda guardado en cada documento como referencia de origen.
const DEFAULT_MODEL = 'claude-sonnet-5'
const COLLECTION = 'exercises'
const EOL = String.fromCharCode(10)

const SYSTEM_PROMPT = [
  'Generás ejercicios de inglés para hispanohablantes.',
  'Devolvés SOLO un array JSON, sin markdown ni texto alrededor.',
  'Cada objeto tiene exactamente las claves "sentence", "answer" y "hint".',
  'sentence: una oración natural en inglés, nivel A2-B1, con exactamente un [x] en el lugar donde va la palabra pedida.',
  'answer: exactamente la palabra pedida, tal cual te la paso, sin cambiarle mayúsculas ni agregarle nada.',
  'hint: cómo se dice la palabra pedida en español EN ESA ORACIÓN, concordando en género y número.',
  'El hint es solo la palabra o expresión, nunca una explicación y nunca la traducción de otra palabra de la oración.',
  'Variá los ejercicios entre sí: distintos sujetos, tiempos verbales, personas y contextos.',
].join(' ')

// ---------------------------------------------------------------- argumentos

interface Options {
  type: string | null
  subtype: string | null
  word: string | null
  limit: number | null
  count: number
  model: string
  write: boolean
  yes: boolean
  overwrite: boolean
  verbose: boolean
  list: boolean
  help: boolean
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    type: null,
    subtype: null,
    word: null,
    limit: null,
    count: DEFAULT_COUNT,
    model: DEFAULT_MODEL,
    write: false,
    yes: false,
    overwrite: false,
    verbose: false,
    list: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const equals = arg.indexOf('=')
    const name = equals === -1 ? arg : arg.slice(0, equals)
    const inlineValue = equals === -1 ? null : arg.slice(equals + 1)
    const nextValue = () => {
      if (inlineValue !== null) return inlineValue
      index += 1
      const value = argv[index]
      if (value === undefined) throw new Error(`falta el valor de ${name}`)
      return value
    }

    switch (name) {
      case '--type':
        options.type = nextValue()
        break
      case '--subtype':
        options.subtype = nextValue()
        break
      case '--word':
        options.word = nextValue()
        break
      case '--limit':
        options.limit = Number(nextValue())
        break
      case '--count':
        options.count = Number(nextValue())
        break
      case '--model':
        options.model = nextValue()
        break
      case '--write':
        options.write = true
        break
      case '--yes':
        options.yes = true
        break
      case '--overwrite':
        options.overwrite = true
        break
      case '--verbose':
        options.verbose = true
        break
      case '-l':
      case '--list':
        options.list = true
        break
      case '--dry-run':
        options.write = false
        break
      case '-h':
      case '--help':
        options.help = true
        break
      default:
        throw new Error(`opción desconocida: ${arg}`)
    }
  }

  return options
}

function printHelp(): void {
  const sections = groups.map((group) => group.key).join(' | ')
  console.log(`
Genera ejercicios con Claude headless y los sube a Firestore.

  npm run gen                       menú interactivo (elegís sección y subtipo)
  npm run gen:list                  lista las secciones con sus subtipos
  npm run gen -- --type <seccion>   directo, sin menú

Secciones: ${sections}

  --type <key>       La sección a generar. Sin esto abre el menú interactivo.
  --subtype <key>    Limita a un subtipo (ej: place-prepositions).
  --word <palabra>   Limita a una sola palabra.
  --limit <n>        Procesa como mucho n palabras.
  --count <n>        Ejercicios por palabra (default ${DEFAULT_COUNT}).
  --model <alias>    Modelo de claude (default ${DEFAULT_MODEL}).
  --write            Escribe en Firestore. Sin esto es dry-run y no toca la base.
  --yes              Saltea la confirmación interactiva de --write.
  --overwrite        Regenera palabras que ya tienen documento (por defecto las saltea).
  --verbose          Muestra todos los ejercicios generados, no solo una muestra.
  -l, --list         Lista las secciones y subtipos disponibles.
  -h, --help         Esta ayuda.

Variables de entorno:
  VITE_*             Config de Firebase. Se leen del .env de la raíz.
  CLAUDE_CLI         Ruta al ejecutable de claude, si no se resuelve solo.
`)
}

function printList(): void {
  console.log('')
  for (const item of groups) {
    const group = getGroup(item.key)
    if (!group) continue

    if (group.subtypes.length === 0) {
      const words = group.words ?? []
      console.log(`  ${group.key.padEnd(18)} ${group.value}  (${words.length} palabras, sin subtipos)`)
    } else {
      const words = group.subtypes.reduce((total, subtype) => total + subtype.words.length, 0)
      console.log(`  ${group.key.padEnd(18)} ${group.value}  (${group.subtypes.length} subtipos, ${words} palabras)`)
      for (const subtype of group.subtypes) {
        console.log(`    ${subtype.key.padEnd(26)} ${subtype.value.padEnd(16)} ${subtype.words.length} palabras`)
      }
    }
    console.log('')
  }
}

// -------------------------------------------------------------------- targets

interface Target {
  section: string
  sectionLabel: string
  subtype: string | null
  subtypeLabel: string | null
  word: string
  docId: string
}

/** Id de documento seguro para Firestore. El artículo cero ('-') queda como 'zero'. */
function slug(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'zero'
}

function buildTargets(options: Options): Target[] {
  if (!options.type) throw new Error('falta --type. Usá --help para ver las secciones.')

  const group = getGroup(options.type)
  if (!group) {
    const available = groups.map((item) => item.key).join(', ')
    throw new Error(`sección desconocida: ${options.type}. Disponibles: ${available}`)
  }

  const targets: Target[] = []

  const push = (word: string, subtype: string | null, subtypeLabel: string | null) => {
    targets.push({
      section: group.key,
      sectionLabel: group.value,
      subtype,
      subtypeLabel,
      word,
      docId: [group.key, subtype, slug(word)].filter(Boolean).join('__'),
    })
  }

  if (group.subtypes.length === 0) {
    if (options.subtype) {
      throw new Error(`la sección ${group.key} no tiene subtipos`)
    }
    const words = group.words ?? []
    if (words.length === 0) throw new Error(`la sección ${group.key} no tiene palabras en su config`)
    words.forEach((word) => push(word, null, null))
  } else {
    const subtypes = options.subtype
      ? group.subtypes.filter((subtype) => subtype.key === options.subtype)
      : group.subtypes
    if (subtypes.length === 0) {
      const available = group.subtypes.map((subtype) => subtype.key).join(', ')
      throw new Error(`subtipo desconocido: ${options.subtype}. Disponibles: ${available}`)
    }
    subtypes.forEach((subtype) => {
      subtype.words.forEach((word) => push(word, subtype.key, subtype.value))
    })
  }

  const filtered = options.word
    ? targets.filter((target) => target.word.toLowerCase() === options.word?.toLowerCase())
    : targets
  if (filtered.length === 0) throw new Error(`la palabra "${options.word}" no está en esa sección`)

  return options.limit ? filtered.slice(0, options.limit) : filtered
}

// --------------------------------------------------------------------- claude

interface ClaudeCli {
  command: string
  useShell: boolean
}

/**
 * En Windows `claude` es un .cmd, que Node no puede spawnear sin shell. El .cmd
 * llama a un .exe real: si lo encontramos, lo usamos directo y nos ahorramos el
 * shell (y sus problemas de comillas).
 */
function resolveClaudeCli(): ClaudeCli {
  const override = process.env.CLAUDE_CLI
  if (override) return { command: override, useShell: false }
  if (process.platform !== 'win32') return { command: 'claude', useShell: false }

  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    if (!dir) continue
    const candidates = [
      path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe'),
      path.join(dir, 'claude.exe'),
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) return { command: candidate, useShell: false }
    }
  }

  return { command: 'claude', useShell: true }
}

const cli = resolveClaudeCli()

function runClaude(prompt: string, model: string): Promise<string> {
  const args = [
    '-p',
    '--model',
    model,
    '--output-format',
    'json',
    '--restricted',
    '--no-session-persistence',
    '--setting-sources',
    '',
    '--system-prompt',
    SYSTEM_PROMPT,
  ]

  return new Promise((resolve, reject) => {
    const child = spawn(cli.command, args, { shell: cli.useShell })
    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => (stdout += chunk))
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk: string) => (stderr += chunk))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`claude terminó con código ${code}. ${stderr.trim().slice(0, 300)}`))
        return
      }
      resolve(stdout)
    })

    child.stdin.end(prompt)
  })
}

interface ClaudeEnvelope {
  is_error?: boolean
  result?: string
  subtype?: string
  total_cost_usd?: number
  modelUsage?: Record<string, { canonicalModel?: string }>
}

/** El modelo que respondió de verdad, no el que pedimos. */
function usedModel(envelope: ClaudeEnvelope, requested: string): string {
  const usage = envelope.modelUsage ?? {}
  const [name, detail] = Object.entries(usage)[0] ?? []
  return detail?.canonicalModel ?? name ?? requested
}

function promptFor(target: Target, count: number): string {
  const category = target.subtypeLabel
    ? `${target.sectionLabel} / ${target.subtypeLabel}`
    : target.sectionLabel

  const lines = [
    `Categoría: ${category}`,
    `Palabra: "${target.word}"`,
    `Generá ${count} ejercicios donde la respuesta sea exactamente "${target.word}".`,
  ]

  if (target.word === '-') {
    lines.push(
      'Ojo: la palabra pedida es el artículo cero. Las oraciones tienen que ser casos donde en inglés NO va ningún artículo,',
      'answer tiene que ser exactamente "-" y hint tiene que ser "sin artículo".',
    )
  }

  return lines.join('\n')
}

// ------------------------------------------------------------------ validación

interface Validation {
  exercises: Exercise[]
  rejected: string[]
}

function countBlanks(sentence: string): number {
  return (sentence.match(/\[x\]/gi) ?? []).length
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractJsonArray(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`la respuesta no trae un array JSON: ${text.slice(0, 200)}`)
  }
  return JSON.parse(cleaned.slice(start, end + 1))
}

function validate(raw: unknown, target: Target, count: number): Validation {
  if (!Array.isArray(raw)) throw new Error('la respuesta no es un array')

  const exercises: Exercise[] = []
  const rejected: string[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    if (!isRecord(item)) {
      rejected.push('item que no es un objeto')
      continue
    }

    const sentence = typeof item.sentence === 'string' ? item.sentence.trim() : ''
    const answer = typeof item.answer === 'string' ? item.answer.trim() : ''
    const hint = typeof item.hint === 'string' ? item.hint.trim() : ''

    if (!sentence || !answer || !hint) {
      rejected.push(`campos vacíos: ${JSON.stringify(item).slice(0, 80)}`)
      continue
    }
    if (countBlanks(sentence) !== 1) {
      rejected.push(`no tiene exactamente un [x]: ${sentence}`)
      continue
    }
    if (answer.toLowerCase() !== target.word.toLowerCase()) {
      rejected.push(`answer "${answer}" no es la palabra "${target.word}"`)
      continue
    }

    const key = sentence.toLowerCase()
    if (seen.has(key)) {
      rejected.push(`oración repetida: ${sentence}`)
      continue
    }
    seen.add(key)

    exercises.push({
      word: target.word,
      exerciseNumber: exercises.length + 1,
      sentence: sentence.replace(/\[x\]/gi, '[x]'),
      answer: target.word,
      hint,
    })

    if (exercises.length === count) break
  }

  return { exercises, rejected }
}

// ------------------------------------------------------------------- firestore

/** Carga el .env de la raíz del repo, para no depender de --env-file. */
function loadEnv(): void {
  const envPath = path.join(import.meta.dirname, '..', '.env')
  if (!existsSync(envPath)) return
  try {
    process.loadEnvFile(envPath)
  } catch {
    // si el .env está mal formado seguimos: createDb avisa qué falta
  }
}

/** Las reglas de Firestore son el error más probable acá: que se explique solo. */
function isPermissionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('Missing or insufficient permissions') || message.includes('permission-denied')
  )
}

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (!isPermissionError(error)) return message

  return [
    `Firestore rechazó la operación: las reglas no permiten tocar la colección "${COLLECTION}".`,
    '',
    '  Firebase Console > Firestore Database > Reglas:',
    '',
    `    match /${COLLECTION}/{doc} {`,
    '      allow read, write: if true;',
    '    }',
    '',
    '  Cuando termines de generar, sacá el write y dejá solo el read.',
  ].join(EOL)
}

function createDb() {
  const config = {
    apiKey: process.env.VITE_API_KEY,
    authDomain: process.env.VITE_AUTH_DOMAIN,
    projectId: process.env.VITE_PROJECT_ID,
    storageBucket: process.env.VITE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_APP_ID,
  }

  if (!config.projectId || !config.apiKey) {
    throw new Error('faltan las variables VITE_* de Firebase: revisá el .env de la raíz')
  }

  return getFirestore(initializeApp(config))
}

// ------------------------------------------------------------------------ main

// Una sola interfaz para todas las preguntas: si se abre y cierra una por
// pregunta, la segunda se queda sin stdin cuando la entrada viene por pipe.
let prompts: Interface | null = null

async function ask(question: string): Promise<string> {
  prompts ??= createInterface({ input: process.stdin, output: process.stdout })
  return (await prompts.question(question)).trim()
}

/** Cierra la interfaz de preguntas, para que el proceso pueda terminar solo. */
function closePrompts(): void {
  prompts?.close()
  prompts = null
}

async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    throw new Error('no hay terminal interactiva para confirmar: pasá --yes si estás seguro')
  }
  return ['si', 'sí', 's', 'yes', 'y'].includes((await ask(question)).toLowerCase())
}

/**
 * Cuando no viene --type, deja elegir sección y subtipo desde un menú numerado.
 * Devuelve true si eligió por menú (ahí después preguntamos si escribe o no).
 */
async function selectInteractively(options: Options): Promise<boolean> {
  if (options.type) return false
  if (!process.stdin.isTTY) {
    throw new Error('falta --type. Usá --list para ver las secciones o --help para las opciones.')
  }

  console.log('')
  console.log('  Secciones:')
  groups.forEach((item, index) => {
    const group = getGroup(item.key)
    const detail =
      group && group.subtypes.length > 0
        ? `${group.subtypes.length} subtipos`
        : `${group?.words?.length ?? 0} palabras`
    console.log(`   ${String(index + 1).padStart(2)}. ${item.value.padEnd(16)} ${detail}`)
  })

  console.log('')
  const section = groups[Number(await ask('  Sección (número): ')) - 1]
  if (!section) throw new Error('no elegiste una sección válida')
  options.type = section.key

  const group = getGroup(section.key)
  if (group && group.subtypes.length > 0) {
    console.log('')
    console.log(`  Subtipos de ${group.value}:`)
    console.log('    0. Todos')
    group.subtypes.forEach((subtype, index) => {
      console.log(
        `   ${String(index + 1).padStart(2)}. ${subtype.value.padEnd(16)} ${subtype.words.length} palabras`,
      )
    })

    console.log('')
    const answer = await ask('  Subtipo (número, 0 = todos): ')
    if (answer !== '0') {
      const subtype = group.subtypes[Number(answer) - 1]
      if (!subtype) throw new Error('no elegiste un subtipo válido')
      options.subtype = subtype.key
    }
  }

  return true
}

async function main(): Promise<void> {
  loadEnv()
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
    return
  }
  if (options.list) {
    printList()
    return
  }
  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('--count tiene que ser un entero mayor a 0')
  }
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error('--limit tiene que ser un entero mayor a 0')
  }

  const fromMenu = await selectInteractively(options)
  const targets = buildTargets(options)
  const subtypeCount = new Set(targets.map((target) => target.subtype).filter(Boolean)).size

  console.log('')
  console.log(`  Sección:    ${targets[0].sectionLabel} (${targets[0].section})`)
  if (subtypeCount > 0) console.log(`  Subtipos:   ${subtypeCount}`)
  console.log(`  Palabras:   ${targets.length}`)
  console.log(`  Ejercicios: ${targets.length * options.count} (${options.count} por palabra)`)
  console.log(`  Modelo:     ${options.model}`)
  console.log('')

  if (fromMenu && !options.write) {
    options.write = await confirm(`  ¿Escribir en "${COLLECTION}"? (si/no, no = dry-run) `)
  } else if (options.write && !options.yes) {
    const ok = await confirm(
      `  Se van a escribir hasta ${targets.length} documentos en "${COLLECTION}". ¿Seguir? (si/no) `,
    )
    if (!ok) {
      closePrompts()
      console.log('  Cancelado.')
      return
    }
  }

  closePrompts()
  console.log(`  Modo:       ${options.write ? 'ESCRIBE en Firestore' : 'dry-run (no escribe)'}`)
  console.log('')

  const db = options.write ? createDb() : null

  if (db) {
    // lectura de prueba: si las reglas están cerradas, cortamos antes de generar nada
    await getDoc(doc(db, COLLECTION, '__permission-probe'))
  }

  const modelsUsed = new Set<string>()
  let written = 0
  let skipped = 0
  const failed: string[] = []
  const short: string[] = []

  for (const [index, target] of targets.entries()) {
    const position = `[${index + 1}/${targets.length}]`
    const label = target.subtype ? `${target.subtype}/${target.word}` : `${target.section}/${target.word}`

    if (db && !options.overwrite) {
      const existing = await getDoc(doc(db, COLLECTION, target.docId))
      if (existing.exists()) {
        console.log(`${position} ${label}: ya existe, se saltea`)
        skipped += 1
        continue
      }
    }

    try {
      const stdout = await runClaude(promptFor(target, options.count), options.model)
      const envelope = JSON.parse(stdout) as ClaudeEnvelope
      if (envelope.is_error || typeof envelope.result !== 'string') {
        throw new Error(`claude devolvió un error (${envelope.subtype ?? 'sin detalle'})`)
      }

      const model = usedModel(envelope, options.model)
      modelsUsed.add(model)

      const { exercises, rejected } = validate(extractJsonArray(envelope.result), target, options.count)

      if (exercises.length === 0) {
        failed.push(`${label}: no quedó ningún ejercicio válido (${rejected[0] ?? 'sin detalle'})`)
        console.log(`${position} ${label}: SIN EJERCICIOS VÁLIDOS`)
        continue
      }
      if (exercises.length < options.count) {
        short.push(`${label}: ${exercises.length}/${options.count}`)
      }

      const note = rejected.length > 0 ? ` (${rejected.length} descartados)` : ''

      if (db) {
        await setDoc(doc(db, COLLECTION, target.docId), {
          section: target.section,
          subtype: target.subtype,
          word: target.word,
          exercises,
          model,
          generatedAt: new Date().toISOString(),
        })
        written += 1
        console.log(`${position} ${label}: ${exercises.length} ejercicios -> ${target.docId}${note}`)
      } else {
        console.log(`${position} ${label}: ${exercises.length} ejercicios -> ${target.docId}${note}`)
        const sample = options.verbose ? exercises : exercises.slice(0, 3)
        sample.forEach((exercise) => {
          console.log(`        ${exercise.exerciseNumber}. ${exercise.sentence}  [${exercise.hint}]`)
        })
      }
    } catch (error) {
      if (isPermissionError(error)) throw error
      const message = error instanceof Error ? error.message : String(error)
      failed.push(`${label}: ${message}`)
      console.log(`${position} ${label}: ERROR ${message}`)
    }
  }

  console.log('')
  if (modelsUsed.size > 0) console.log(`  Modelo real: ${[...modelsUsed].join(', ')}`)
  console.log(`  Escritos:  ${written}`)
  console.log(`  Salteados: ${skipped}`)
  console.log(`  Fallados:  ${failed.length}`)
  if (short.length > 0) {
    console.log(`  Incompletos (${short.length}): ${short.join(', ')}`)
  }
  failed.forEach((message) => console.log(`    - ${message}`))
  console.log('')
}

main().catch((error: unknown) => {
  console.error(EOL + '  ' + describeError(error) + EOL)
  process.exitCode = 1
})
