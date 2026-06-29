import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  Link2Off,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  editable?: boolean
  placeholder?: string
}

interface ColorOption {
  key: 'default' | 'indigo' | 'violet' | 'magenta' | 'muted'
  value: string | null
  swatch: string
}

const COLOR_OPTIONS: ColorOption[] = [
  { key: 'default', value: null, swatch: 'var(--foreground)' },
  { key: 'indigo', value: '#6366f1', swatch: '#6366f1' },
  { key: 'violet', value: '#8b5cf6', swatch: '#8b5cf6' },
  { key: 'magenta', value: '#ec1e8c', swatch: '#ec1e8c' },
  { key: 'muted', value: 'var(--muted-foreground)', swatch: 'var(--muted-foreground)' },
]

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'transition-colors duration-150',
        isActive && 'bg-primary/15 text-primary',
      )}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  editable = true,
  placeholder,
}: RichTextEditorProps) {
  const { t } = useTranslation('editor')
  const prefersReducedMotion = useReducedMotion()
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: {},
        bulletList: {},
        orderedList: {},
        bold: {},
        italic: {},
        code: {},
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rich-text-link' },
      }),
      TextStyle,
      Color,
    ],
    content: value,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  if (!editor) return null

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    setLinkUrl(previousUrl ?? '')
    setLinkOpen(true)
  }

  const applyLink = () => {
    const url = linkUrl.trim()
    if (url === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
    setLinkOpen(false)
  }

  const applyColor = (option: ColorOption) => {
    if (option.value === null) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(option.value).run()
    }
  }

  return (
    <div
      className={cn(
        'glass rounded-[var(--radius-card)] border border-border/60',
        'flex flex-col overflow-hidden',
        !prefersReducedMotion && 'transition-shadow duration-200',
        'focus-within:ring-2 focus-within:ring-ring/40',
      )}
    >
      {editable && (
        <div
          role="toolbar"
          aria-label={t('toolbar.label')}
          className="flex flex-wrap items-center gap-0.5 border-b border-border/60 p-1.5"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            label={t('toolbar.heading1')}
          >
            <Heading1 className="size-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            label={t('toolbar.heading2')}
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            label={t('toolbar.heading3')}
          >
            <Heading3 className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            label={t('toolbar.bold')}
          >
            <Bold className="size-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            label={t('toolbar.italic')}
          >
            <Italic className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            label={t('toolbar.bulletList')}
          >
            <List className="size-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            label={t('toolbar.orderedList')}
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            label={t('toolbar.blockquote')}
          >
            <Quote className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <ToolbarButton
            onClick={openLinkDialog}
            isActive={editor.isActive('link')}
            label={t('toolbar.link')}
          >
            <LinkIcon className="size-3.5" />
          </ToolbarButton>

          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              label={t('toolbar.removeLink')}
            >
              <Link2Off className="size-3.5" />
            </ToolbarButton>
          )}

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <Popover>
            <PopoverTrigger
              aria-label={t('toolbar.textColor')}
              className={cn(
                'relative inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-button)]',
                'text-sm font-medium transition-colors',
                'hover:bg-muted hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <Palette className="size-3.5" />
              <span
                aria-hidden
                className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full"
                style={{
                  backgroundColor:
                    (editor.getAttributes('textStyle').color as string | undefined) ??
                    'var(--foreground)',
                }}
              />
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-44 p-2">
              <p className="mb-1.5 px-0.5 text-xs font-medium text-muted-foreground">
                {t('color.label')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-label={t(`color.${opt.key}`)}
                    onClick={() => applyColor(opt)}
                    className={cn(
                      'size-5 rounded-full border-2 transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      'hover:scale-110',
                      opt.value !== null &&
                        editor.isActive('textStyle', { color: opt.value })
                        ? 'border-foreground'
                        : 'border-transparent',
                    )}
                    style={{ backgroundColor: opt.swatch }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <EditorContent
        editor={editor}
        className={cn(
          'rich-text-editor min-h-[160px] flex-1 px-4 py-3',
          'text-sm leading-relaxed text-foreground',
          '[&_.tiptap]:outline-none',
          '[&_.tiptap_h1]:mb-2 [&_.tiptap_h1]:font-display [&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-semibold [&_.tiptap_h1]:tracking-tight [&_.tiptap_h1]:text-foreground',
          '[&_.tiptap_h2]:mb-1.5 [&_.tiptap_h2]:font-display [&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:tracking-tight [&_.tiptap_h2]:text-foreground',
          '[&_.tiptap_h3]:mb-1 [&_.tiptap_h3]:font-display [&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:text-foreground',
          '[&_.tiptap_p]:mb-3 [&_.tiptap_p:last-child]:mb-0',
          '[&_.tiptap_strong]:font-semibold',
          '[&_.tiptap_em]:italic',
          '[&_.tiptap_ul]:mb-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5',
          '[&_.tiptap_ol]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5',
          '[&_.tiptap_li]:mb-0.5',
          '[&_.tiptap_blockquote]:my-3 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-primary/60 [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_blockquote]:italic',
          '[&_.tiptap_code]:rounded [&_.tiptap_code]:bg-muted [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-xs',
          '[&_.rich-text-link]:text-primary [&_.rich-text-link]:underline [&_.rich-text-link]:underline-offset-2 [&_.rich-text-link:hover]:text-primary/80',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/50 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        )}
      />

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('link.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rich-text-link-url">{t('link.urlLabel')}</Label>
            <Input
              id="rich-text-link-url"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
              }}
              placeholder={t('link.placeholder')}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setLinkOpen(false)}>
              {t('link.cancel')}
            </Button>
            <Button type="button" onClick={applyLink}>
              {t('link.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
