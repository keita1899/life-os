import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export const REMARK_PLUGINS = [remarkGfm]
export const REHYPE_PLUGINS: [typeof rehypeHighlight, { detect: boolean }][] = [
  [rehypeHighlight, { detect: true }],
]

export const MARKDOWN_CONTAINER_CLASSES =
  'text-sm leading-relaxed ' +
  '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-2 ' +
  '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 ' +
  '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 ' +
  '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 ' +
  '[&_p]:my-2 ' +
  '[&_ul]:my-2 [&_ul]:pl-6 [&_ul]:list-disc ' +
  '[&_ol]:my-2 [&_ol]:pl-6 [&_ol]:list-decimal ' +
  '[&_li]:my-0.5 ' +
  '[&_ul_ul]:my-0 [&_ol_ol]:my-0 [&_ul_ol]:my-0 [&_ol_ul]:my-0 ' +
  '[&_strong]:font-bold [&_em]:italic ' +
  '[&_a]:underline [&_a]:text-blue-600 dark:[&_a]:text-blue-400 ' +
  '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:font-mono ' +
  '[&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre]:text-xs ' +
  '[&_pre_code]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:text-inherit ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground ' +
  '[&_hr]:my-4 [&_hr]:border-border ' +
  '[&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_table]:text-sm ' +
  '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left ' +
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5'
