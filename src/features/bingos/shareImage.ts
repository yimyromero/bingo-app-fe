// Draws the 1080x1080 "Share Update" image on a canvas.
// It is a dedicated layout, it does not capture the app UI, and it only
// uses the title, raffle date, cell numbers and participant names.

export type ShareLayout = 'names' | 'list' | 'private'

export interface ShareCell {
  cellNumber: number
  participantName: string | null
}

export interface ShareColors {
  primary: string
  primaryText: string
  background: string
  surface: string
  text: string
  muted: string
  border: string
}

export interface ShareImageInput {
  title: string
  raffleDate?: string | null // already formatted for display
  cells: ShareCell[]
  layout: ShareLayout
  colors: ShareColors
  labels: ShareLabels
}

export interface ShareImageResult {
  blob: Blob
  message: string
  // false when the grid is too dense to print names inside the cells
  namesFit: boolean
}

export interface ShareStats {
  taken: number
  available: number
  total: number
  percent: number
}

export const getShareStats = (cells: ShareCell[]): ShareStats => {
  const total = cells.length
  const taken = cells.filter((c) => c.participantName?.trim()).length
  return {
    taken,
    available: total - taken,
    total,
    percent: total ? Math.round((taken / total) * 100) : 0,
  }
}

// every piece of text drawn on the image, so it can be translated by the caller
export interface ShareLabels {
  message: (stats: ShareStats) => string
  raffle: (date: string) => string
  taken: string
  available: string
  total: string
  filled: string
  takenSpots: string
  legendTaken: string
  legendAvailable: string
  cellTaken: string
  cellAvailable: string
  more: (count: number) => string
}

const SIZE = 1080
const PAD = 56
const FONT = '"Roboto", "Helvetica", "Arial", sans-serif'
// below this cell size names are not printed inside the grid
const MIN_NAME_CELL = 100

type Ctx = CanvasRenderingContext2D

const setFont = (ctx: Ctx, size: number, weight = 400) => {
  ctx.font = `${weight} ${size}px ${FONT}`
}

const roundRectPath = (
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

const ellipsize = (ctx: Ctx, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text
  let result = text
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1)
  }
  return `${result.trimEnd()}…`
}

// shrink the font until the text fits on one line
const fitFont = (
  ctx: Ctx,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
  weight: number
) => {
  let size = start
  setFont(ctx, size, weight)
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 2
    setFont(ctx, size, weight)
  }
  return size
}

const wrapLines = (
  ctx: Ctx,
  text: string,
  maxWidth: number,
  maxLines: number
) => {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = ellipsize(
      ctx,
      `${kept[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`,
      maxWidth
    )
    return kept
  }
  return lines.map((line) => ellipsize(ctx, line, maxWidth))
}

// pick the column count that gives the biggest square cells in the area
const bestGrid = (count: number, areaW: number, areaH: number, gap: number) => {
  const base = Math.max(1, Math.ceil(Math.sqrt(count)))
  let best = { cols: base, rows: Math.ceil(count / base), cell: 0 }

  for (let cols = base; cols <= base + 2; cols++) {
    const rows = Math.ceil(count / cols)
    const cell = Math.floor(
      Math.min(
        (areaW - gap * (cols - 1)) / cols,
        (areaH - gap * (rows - 1)) / rows
      )
    )
    if (cell > best.cell) best = { cols, rows, cell }
  }
  return best
}

const drawGrid = (
  ctx: Ctx,
  cells: ShareCell[],
  area: { x: number; y: number; w: number; h: number },
  layout: ShareLayout,
  colors: ShareColors,
  labels: ShareLabels
) => {
  const gap = cells.length > 64 ? 6 : 10
  const { cols, rows, cell } = bestGrid(cells.length, area.w, area.h, gap)
  const gridW = cols * cell + (cols - 1) * gap
  const gridH = rows * cell + (rows - 1) * gap
  const startX = area.x + (area.w - gridW) / 2
  const startY = area.y + (area.h - gridH) / 2
  const radius = Math.max(6, cell * 0.12)
  const namesFit = cell >= MIN_NAME_CELL
  const showNames = layout === 'names' && namesFit
  const roomy = cell >= MIN_NAME_CELL

  cells.forEach((item, i) => {
    const x = startX + (i % cols) * (cell + gap)
    const y = startY + Math.floor(i / cols) * (cell + gap)
    const name = item.participantName?.trim()
    const cx = x + cell / 2

    roundRectPath(ctx, x, y, cell, cell, radius)
    if (name) {
      ctx.fillStyle = colors.primary
      ctx.fill()
    } else {
      ctx.fillStyle = colors.surface
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = colors.border
      ctx.stroke()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    if (name && showNames) {
      // number in the corner, name in the middle
      const numSize = Math.max(13, Math.min(22, cell * 0.14))
      ctx.fillStyle = colors.primaryText
      ctx.globalAlpha = 0.8
      setFont(ctx, numSize, 700)
      ctx.textAlign = 'left'
      ctx.fillText(String(item.cellNumber), x + 10, y + numSize + 6)
      ctx.globalAlpha = 1
      ctx.textAlign = 'center'

      const maxWidth = cell - 16
      const nameSize = Math.max(14, Math.min(28, cell * 0.17))
      setFont(ctx, nameSize, 500)
      const maxLines = cell >= 140 ? 3 : 2
      const lines = wrapLines(ctx, name, maxWidth, maxLines)
      const lineH = nameSize * 1.2
      const top =
        y + cell / 2 - ((lines.length - 1) * lineH) / 2 + nameSize * 0.55
      ctx.fillStyle = colors.primaryText
      lines.forEach((line, n) => ctx.fillText(line, cx, top + n * lineH))
    } else {
      const numSize = Math.max(12, Math.min(44, cell * 0.38))
      setFont(ctx, numSize, 700)
      ctx.fillStyle = name ? colors.primaryText : colors.text
      const labelH = roomy ? Math.max(14, cell * 0.12) : 0
      const baseline = y + cell / 2 + numSize * 0.35 - labelH * 0.5
      ctx.fillText(String(item.cellNumber), cx, baseline)

      if (roomy) {
        const labelSize = Math.max(13, Math.min(20, cell * 0.14))
        setFont(ctx, labelSize, 500)
        ctx.fillStyle = name ? colors.primaryText : colors.muted
        ctx.globalAlpha = name ? 0.85 : 1
        ctx.fillText(
          name ? labels.cellTaken : labels.cellAvailable,
          cx,
          baseline + labelSize + 8
        )
        ctx.globalAlpha = 1
      }
    }
  })

  return namesFit
}

interface TakenPerson {
  name: string
  numbers: number[]
}

// one entry per participant, with every number they hold
const groupByParticipant = (cells: ShareCell[]): TakenPerson[] => {
  const groups = new Map<string, TakenPerson>()

  cells.forEach((cell) => {
    const name = cell.participantName?.trim().replace(/\s+/g, ' ')
    if (!name) return
    const key = name.toLowerCase()
    const person = groups.get(key)
    if (person) person.numbers.push(cell.cellNumber)
    else groups.set(key, { name, numbers: [cell.cellNumber] })
  })

  return [...groups.values()]
    .map((p) => ({ ...p, numbers: p.numbers.sort((a, b) => a - b) }))
    .sort((a, b) => a.numbers[0]! - b.numbers[0]!)
}

const drawTakenList = (
  ctx: Ctx,
  cells: ShareCell[],
  area: { x: number; y: number; w: number; h: number },
  colors: ShareColors,
  labels: ShareLabels
) => {
  const people = groupByParticipant(cells)

  setFont(ctx, 20, 700)
  ctx.fillStyle = colors.muted
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(labels.takenSpots, area.x, area.y + 18)

  if (!people.length) return

  const chipH = 38
  const gapX = 10
  const gapY = 10
  const padX = 14
  const pillH = 26
  const pillGap = 6
  const nameGap = 12
  const top = area.y + 34
  const maxRows = Math.max(
    1,
    Math.floor((area.y + area.h - top + gapY) / (chipH + gapY))
  )

  const pillWidth = (label: string) => {
    setFont(ctx, 16, 700)
    return Math.max(26, ctx.measureText(label).width + 16)
  }

  // measure each chip: "name  [2] [3] [34]", numbers are cut with "+k" if needed
  const chips = people.map((person) => {
    setFont(ctx, 21, 500)
    const name = ellipsize(ctx, person.name, area.w * 0.55)
    const nameW = ctx.measureText(name).width
    const base = padX + nameW + nameGap + 10

    const pills: string[] = []
    let width = base
    for (let i = 0; i < person.numbers.length; i++) {
      const label = String(person.numbers[i])
      const next = width + pillWidth(label) + (pills.length ? pillGap : 0)
      if (next > area.w) {
        // not enough room: replace the tail with a "+k" pill
        let hidden = person.numbers.length - pills.length
        while (
          pills.length &&
          width + pillWidth(`+${hidden}`) + pillGap > area.w
        ) {
          const removed = pills.pop()!
          width -= pillWidth(removed) + (pills.length ? pillGap : 0)
          hidden++
        }
        const more = `+${hidden}`
        width += pillWidth(more) + (pills.length ? pillGap : 0)
        pills.push(more)
        break
      }
      width = next
      pills.push(label)
    }
    return { name, nameW, pills, width }
  })

  // flow the chips left to right, wrapping to a new row when full
  const placed: { chip: (typeof chips)[number]; x: number; row: number }[] = []
  let x = area.x
  let row = 0
  chips.forEach((chip) => {
    if (x > area.x && x + chip.width > area.x + area.w) {
      row++
      x = area.x
    }
    placed.push({ chip, x, row })
    x += chip.width + gapX
  })

  let visible = placed.filter((p) => p.row < maxRows)
  let hiddenPeople = placed.length - visible.length

  const moreLabel = () => labels.more(hiddenPeople)
  const moreWidth = () => {
    setFont(ctx, 20, 500)
    return ctx.measureText(moreLabel()).width + 28
  }

  let moreX = area.x
  if (hiddenPeople > 0) {
    // make room for the "+N more" chip at the end of the last row
    const lastRow = maxRows - 1
    for (;;) {
      const inRow = visible.filter((p) => p.row === lastRow)
      const last = inRow[inRow.length - 1]
      const end = last ? last.x + last.chip.width + gapX : area.x
      moreX = end
      if (end + moreWidth() <= area.x + area.w || !last) break
      visible = visible.filter((p) => p !== last)
      hiddenPeople++
    }
  }

  visible.forEach(({ chip, x: cx, row: r }) => {
    const y = top + r * (chipH + gapY)

    roundRectPath(ctx, cx, y, chip.width, chipH, 12)
    ctx.fillStyle = colors.surface
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = colors.border
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillStyle = colors.text
    setFont(ctx, 21, 500)
    ctx.fillText(chip.name, cx + padX, y + chipH / 2 + 7)

    let px = cx + padX + chip.nameW + nameGap
    chip.pills.forEach((label) => {
      const pw = pillWidth(label)
      roundRectPath(ctx, px, y + (chipH - pillH) / 2, pw, pillH, 9)
      ctx.fillStyle = colors.primary
      ctx.fill()
      ctx.fillStyle = colors.primaryText
      ctx.textAlign = 'center'
      setFont(ctx, 16, 700)
      ctx.fillText(label, px + pw / 2, y + chipH / 2 + 5.5)
      px += pw + pillGap
    })
  })

  if (hiddenPeople > 0) {
    const y = top + (maxRows - 1) * (chipH + gapY)
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.muted
    setFont(ctx, 20, 500)
    ctx.fillText(moreLabel(), moreX + 14, y + chipH / 2 + 7)
  }
}

export const renderBingoImage = async (
  input: ShareImageInput
): Promise<ShareImageResult> => {
  const { title, raffleDate, cells, layout, colors, labels } = input

  // make sure the webfont is ready before drawing text with it
  try {
    await Promise.all([
      document.fonts.load(`400 20px Roboto`),
      document.fonts.load(`500 20px Roboto`),
      document.fonts.load(`700 20px Roboto`),
    ])
  } catch {
    // fall back to the system font
  }

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')

  const stats = getShareStats(cells)
  const message = labels.message(stats)
  const contentW = SIZE - PAD * 2

  // background and accent strip
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = colors.primary
  ctx.fillRect(0, 0, SIZE, 14)

  // brand: mini grid glyph + name
  const glyph = 34
  const g = 9
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? colors.primary : colors.border
      roundRectPath(ctx, PAD + c * (g + 2), 46 + r * (g + 2), g, g, 2)
      ctx.fill()
    }
  }
  setFont(ctx, 26, 700)
  ctx.fillStyle = colors.muted
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('BINGOS', PAD + glyph + 16, 76)

  if (raffleDate) {
    setFont(ctx, 26, 500)
    ctx.textAlign = 'right'
    ctx.fillText(labels.raffle(raffleDate), SIZE - PAD, 76)
  }

  // title
  ctx.textAlign = 'left'
  const titleSize = fitFont(ctx, title, contentW, 60, 34, 700)
  ctx.fillStyle = colors.text
  setFont(ctx, titleSize, 700)
  ctx.fillText(ellipsize(ctx, title, contentW), PAD, 150)

  // update message
  setFont(ctx, 40, 500)
  ctx.fillStyle = colors.primary
  ctx.fillText(message, PAD, 202)

  // stats strip
  const statItems = [
    { label: labels.taken, value: String(stats.taken) },
    { label: labels.available, value: String(stats.available) },
    { label: labels.total, value: String(stats.total) },
    { label: labels.filled, value: `${stats.percent}%` },
  ]
  const statGap = 14
  const statW = (contentW - statGap * 3) / 4
  statItems.forEach((item, i) => {
    const x = PAD + i * (statW + statGap)
    roundRectPath(ctx, x, 224, statW, 76, 14)
    ctx.fillStyle = colors.surface
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = colors.border
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = colors.text
    setFont(ctx, 34, 700)
    ctx.fillText(item.value, x + statW / 2, 224 + 36)
    ctx.fillStyle = colors.muted
    setFont(ctx, 16, 500)
    ctx.fillText(item.label, x + statW / 2, 224 + 60)
  })

  // progress bar
  roundRectPath(ctx, PAD, 318, contentW, 14, 7)
  ctx.fillStyle = colors.border
  ctx.fill()
  if (stats.percent > 0) {
    roundRectPath(
      ctx,
      PAD,
      318,
      Math.max(14, (contentW * stats.percent) / 100),
      14,
      7
    )
    ctx.fillStyle = colors.primary
    ctx.fill()
  }

  // grid (and the list under it, in the list layout)
  const gridTop = 352
  const legendY = SIZE - 52
  const bottom = legendY - 34
  let namesFit = true

  if (layout === 'list') {
    const gridArea = { x: PAD, y: gridTop, w: contentW, h: 300 }
    namesFit = drawGrid(ctx, cells, gridArea, layout, colors, labels)
    drawTakenList(
      ctx,
      cells,
      {
        x: PAD,
        y: gridTop + 300 + 20,
        w: contentW,
        h: bottom - (gridTop + 320),
      },
      colors,
      labels
    )
  } else {
    namesFit = drawGrid(
      ctx,
      cells,
      { x: PAD, y: gridTop, w: contentW, h: bottom - gridTop },
      layout,
      colors,
      labels
    )
  }

  // legend
  const legend = [
    { label: labels.legendTaken, filled: true },
    { label: labels.legendAvailable, filled: false },
  ]
  setFont(ctx, 22, 500)
  const widths = legend.map((l) => 28 + 12 + ctx.measureText(l.label).width)
  let lx = (SIZE - (widths[0]! + widths[1]! + 36)) / 2
  legend.forEach((item, i) => {
    roundRectPath(ctx, lx, legendY - 22, 28, 28, 7)
    ctx.fillStyle = item.filled ? colors.primary : colors.surface
    ctx.fill()
    if (!item.filled) {
      ctx.lineWidth = 2
      ctx.strokeStyle = colors.border
      ctx.stroke()
    }
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.muted
    ctx.fillText(item.label, lx + 40, legendY)
    lx += widths[i]! + 36
  })

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error('Could not create the image.')),
      'image/png'
    )
  })

  return { blob, message, namesFit }
}
