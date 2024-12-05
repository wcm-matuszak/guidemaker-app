import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

interface ImageNode {
  node: ProseMirrorNode
  pos: number
}

export const ImageGroup = Extension.create({
  name: 'imageGroup',

  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          group: {
            default: null,
            parseHTML: element => element.dataset.group,
            renderHTML: attributes => {
                if (!attributes.group) return {}
                console.log('Rendering HTML with attributes:', attributes)
                return {
                    'data-group': attributes.group
                }
            }
          }
        }
      }
    ]
  },

  onCreate() {
    let isUpdating = false;

    this.editor.on('transaction', ({ transaction }) => {
      if (isUpdating) return;
      if (!transaction.docChanged) return; // Only process when document actually changes
      
      const images: ImageNode[] = []
      let currentGroup: string | null = null

      isUpdating = true;
      
      transaction.doc.descendants((node, pos) => {
        if (node.type.name === 'image') {
          console.log('Found image:', node)  // Debug log
          console.log('Image node attrs:', node.attrs)
            console.log('Image HTML:', this.editor.view.dom.innerHTML)
          const prev = images[images.length - 1]
          
          if (prev && prev.pos + prev.node.nodeSize === pos) {
            if (!currentGroup) {
                currentGroup = `group-${Date.now()}`
            }
            console.log('Grouping images with:', currentGroup)
            this.editor.chain()
                .setTextSelection(pos)
                .updateAttributes('image', { group: currentGroup })
                .run()
        } 
          
          images.push({ node, pos })
        }
      })

      isUpdating = false;
    })
  }
})
