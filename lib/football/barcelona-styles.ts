const BARCELONA_MATCH_BG_COLOR = '#A50044'
const BARCELONA_MATCH_BG_COLOR_DARK = '#7A0033'
const BARCELONA_MATCH_BLUE = '#004D98'
const BARCELONA_MATCH_BLUE_DARK = '#003366'

export function getBarcelonaMatchBackground(isDark: boolean): string {
  const red = isDark ? BARCELONA_MATCH_BG_COLOR_DARK : BARCELONA_MATCH_BG_COLOR
  const blue = isDark ? BARCELONA_MATCH_BLUE_DARK : BARCELONA_MATCH_BLUE
  return `repeating-linear-gradient(45deg, ${red} 0px, ${red} 8px, ${blue} 8px, ${blue} 16px)`
}

export const BARCELONA_MATCH_TEXT_COLOR = 'text-white'
