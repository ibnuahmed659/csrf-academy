const ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&amp;': '&',
}

export function decodeEntities(text: string): string {
  return text.replace(/&(lt|gt|quot|#39|amp);/g, (m) => ENTITIES[m] ?? m)
}
