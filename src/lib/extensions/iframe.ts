import { Node } from '@tiptap/core'

export interface IframeOptions {
  allowFullscreen: boolean,
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      /**
       * Add an iframe
       */
      setIframe: (options: { src: string }) => ReturnType,
    }
  }
}

export default Node.create<IframeOptions>({
  name: 'iframe',

  group: 'block',  // This allows both inline and block placement

  atom: true,



  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    }
  },

  parseHTML() {
    return [{
      tag: 'iframe',
    }]
  },

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'w-full aspect-video rounded-lg my-4', // This will make YouTube videos look great
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const url = HTMLAttributes.src as string
    let wrapperClass = 'flex flex-wrap justify-center gap-4 my-4 '

    // Add specific classes based on URL
    if (url.includes('youtube.com')) {
      wrapperClass += 'w-full max-w-[560px] aspect-video' // 16:9 ratio for YouTube
    } else if (url.includes('tiktok.com')) {
      wrapperClass += 'max-w-[280px] aspect-[9/16]' // Vertical ratio for TikTok
    }

    return [
      'div',
      { class: wrapperClass },
      ['iframe', { ...HTMLAttributes, class: 'w-full h-full rounded-lg' }]
    ]
  },

  addCommands() {
    return {
      setIframe: (options: { src: string }) => ({ tr, dispatch }) => {
        const { selection } = tr
        const node = this.type.create(options)

        if (dispatch) {
          tr.replaceRangeWith(selection.from, selection.to, node)
        }

        return true
      },
    }
  },
})