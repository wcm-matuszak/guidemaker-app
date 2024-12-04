import { Node } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      addToGallery: (src: string) => ReturnType,
      removeFromGallery: (index: number) => ReturnType
    }
  }
}

export const Gallery = Node.create({
  name: 'gallery',
  
  group: 'block',
  
  content: 'image*',
  
  parseHTML() {
    return [{
      tag: 'div[data-type="gallery"]',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'gallery',
      class: 'grid grid-cols-2 md:grid-cols-3 gap-4 my-4'
    }), 0]
  },

  addCommands() {
    return {
      addToGallery: (src) => ({ chain }) => {
        return chain()
          .insertContent({
            type: 'image',
            attrs: { 
              src,
              class: 'w-full h-full object-cover rounded-lg'
            }
          })
          .run()
      },
      removeFromGallery: (index) => ({ chain }) => {
        return chain()
          .focus()
          .deleteNode('image')
          .run()
      }
    }
  }
})
