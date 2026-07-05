import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.addVirtualFileSystem(pdfFonts)

export function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// --- Minimal markdown -> pdfmake content-tree parser -----------------------
// Handles the subset of markdown our LLM-generated reports actually use:
// # / ## / ### headings, **bold** inline runs, "- " / "* " bullet lists,
// "1. " numbered lists, and plain paragraphs. Anything else falls through
// as a plain paragraph rather than showing raw markdown syntax.

function parseInline(text) {
  const runs = []
  const boldPattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  while ((match = boldPattern.exec(text))) {
    if (match.index > lastIndex) runs.push({ text: text.slice(lastIndex, match.index) })
    runs.push({ text: match[1], bold: true })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) runs.push({ text: text.slice(lastIndex) })
  return runs.length ? runs : [{ text }]
}

function markdownToContent(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const content = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) {
      content.push({ text: parseInline(paragraph.join(' ')), style: 'body', margin: [0, 0, 0, 10] })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list) {
      content.push({ [list.type]: list.items, style: 'body', margin: [0, 0, 0, 12] })
      list = null
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.*)/)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      content.push({
        text: parseInline(heading[2]),
        style: level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3',
        margin: level <= 2 ? [0, 18, 0, 8] : [0, 10, 0, 6],
      })
      continue
    }

    const bullet = line.match(/^[-*]\s+(.*)/)
    if (bullet) {
      flushParagraph()
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
      list.items.push({ text: parseInline(bullet[1]) })
      continue
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)/)
    if (numbered) {
      flushParagraph()
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
      list.items.push({ text: parseInline(numbered[1]) })
      continue
    }

    flushList()
    paragraph.push(line)
  }
  flushParagraph()
  flushList()

  return content.length ? content : [{ text: 'No content available.', style: 'body' }]
}

// Shared, branded report template used by every engine and the strategic
// report - same header/footer/typography everywhere, only the title and
// body markdown change per caller.
export function downloadPdf(title, bodyMarkdown) {
  const generatedAt = new Date()
  const dateStr = generatedAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = generatedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [50, 86, 50, 56],

    header: {
      margin: [50, 26, 50, 0],
      columns: [
        { text: 'ASCENDO AI', style: 'brandMark' },
        { text: title, style: 'headerRight', alignment: 'right' },
      ],
    },

    footer: (currentPage, pageCount) => ({
      margin: [50, 12, 50, 0],
      columns: [
        { text: `Generated ${dateStr} · ${timeStr}`, style: 'footerText' },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' },
      ],
    }),

    content: [
      { text: title, style: 'reportTitle' },
      { text: `Ascendo AI · Strategic Report · Generated ${dateStr}`, style: 'reportMeta', margin: [0, 4, 0, 20] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: '#EFE7E1' }], margin: [0, 0, 0, 20] },
      ...markdownToContent(bodyMarkdown || '_No content available._'),
    ],

    styles: {
      brandMark: { fontSize: 9, bold: true, color: '#F2622E' },
      headerRight: { fontSize: 9, color: '#806F67' },
      footerText: { fontSize: 8, color: '#A69A93' },
      reportTitle: { fontSize: 24, bold: true, color: '#1A1210' },
      reportMeta: { fontSize: 10, color: '#806F67' },
      h1: { fontSize: 18, bold: true, color: '#1A1210' },
      h2: { fontSize: 14, bold: true, color: '#F2622E' },
      h3: { fontSize: 12, bold: true, color: '#1A1210' },
      body: { fontSize: 11, color: '#3A322E' },
    },
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.35 },
  }

  pdfMake.createPdf(docDefinition).open()
}
