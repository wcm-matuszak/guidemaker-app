import { Node } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'
import PhotoLayout from '$lib/components/PhotoLayout.svelte'
import { SvelteNodeViewRenderer } from 'svelte-tiptap';



declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    photoGallery: {
      setPhotoGallery: () => ReturnType
    }
  }
}

export const PhotoGallery = Node.create({
    name: 'photoGallery',
    group: 'block',
    atom: true,
    draggable: true,
  
    addAttributes() {
      return {
        images: {
          default: []
        }
      }
    },
  
    parseHTML() {
      return [{ tag: 'photo-gallery' }]
    },
  
    renderHTML({ HTMLAttributes }) {
      return ['photo-gallery', mergeAttributes(HTMLAttributes)]
    },
  
    addNodeView() {
      return SvelteNodeViewRenderer(PhotoLayout);
    },
  
    addCommands() {
      return {
        setPhotoGallery: () => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { images: [] }
          })
        }
      }
    }
  })
