import { Node } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      addGallery: (layout: 'single' | 'double' | 'triple' | 'quad') => ReturnType,
      addImageToGallery: (src: string, index: number) => ReturnType
    }
  }
}

export const Gallery = Node.create({
  name: 'gallery',
  
  group: 'block',
  
  content: 'galleryCell+',
  
  parseHTML() {
    return [{
      tag: 'div[data-type="gallery"]',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'gallery',
      class: 'gallery-container'
    }), 0]
  },

  addCommands() {
    return {
      addGallery: (layout) => ({ chain }) => {
        const cellCount = {
          single: 1,
          double: 2,
          triple: 3,
          quad: 4
        }[layout];

        const cells = Array(cellCount).fill(0).map((_, index) => ({
          type: 'galleryCell',
          attrs: { index }
        }));

        return chain()
          .insertContent({
            type: this.name,
            attrs: { layout },
            content: cells
          })
          .run()
      }
    }
  }
})

export const GalleryCell = Node.create({
  name: 'galleryCell',
  
  group: 'block',
  
  content: 'image?',
  
  addAttributes() {
    return {
      index: {
        default: 0
      }
    }
  },

  parseHTML() {
    return [{
      tag: 'div[data-type="gallery-cell"]'
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'gallery-cell',
      class: 'gallery-cell'
    }), 0]
  }
})
