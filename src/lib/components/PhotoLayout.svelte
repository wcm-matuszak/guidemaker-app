<script lang="ts">
    import { Image } from "lucide-svelte";
    import type { NodeViewProps } from '@tiptap/core';
    import { NodeViewWrapper } from 'svelte-tiptap';

    export let node: NodeViewProps['node'];
    export let updateAttributes: NodeViewProps['updateAttributes'];
    export let editor: NodeViewProps['editor'];
        
    $: layout = node.attrs.images.length;
    $: allowEdit = editor.isEditable;

    function addPhoto() {
        const url = window.prompt('Enter image URL:');
        if (url) {
            updateAttributes({ 
                images: [...node.attrs.images, url] 
            });
        }
    }

    function removePhoto(index: number) {
        updateAttributes({ 
            images: node.attrs.images.filter((_, i) => i !== index)
        });
    }
</script>

<NodeViewWrapper class="photo-layout-container">
    <div class="photo-layout" data-count={layout}>
        {#if layout === 0}
            <div class="empty-state">
                <Image />&nbsp; Add your first photo to the gallery
            </div>
        {:else if layout === 1}
            <div class="image-wrapper single">
                <img src={node.attrs.images[0]} alt="Photo 1" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(0)}>×</button>
                {/if}
            </div>
        {:else if layout === 2}
            <div class="image-wrapper double-left">
                <img src={node.attrs.images[0]} alt="Photo 1" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(0)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper double-right">
                <img src={node.attrs.images[1]} alt="Photo 2" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(1)}>×</button>
                {/if}
            </div>
        {:else if layout === 3}
            <div class="image-wrapper triple-main">
                <img src={node.attrs.images[0]} alt="Photo 1" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(0)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper triple-top">
                <img src={node.attrs.images[1]} alt="Photo 2" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(1)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper triple-bottom">
                <img src={node.attrs.images[2]} alt="Photo 3" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(2)}>×</button>
                {/if}
            </div>
        {:else if layout === 4}
            <div class="image-wrapper quad-main">
                <img src={node.attrs.images[0]} alt="Photo 1" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(0)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quad-top">
                <img src={node.attrs.images[1]} alt="Photo 2" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(1)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quad-bottom-left">
                <img src={node.attrs.images[2]} alt="Photo 3" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(2)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quad-bottom-right">
                <img src={node.attrs.images[3]} alt="Photo 4" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(3)}>×</button>
                {/if}
            </div>
        {:else if layout === 5}
            <div class="image-wrapper quint-main">
                <img src={node.attrs.images[0]} alt="Photo 1" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(0)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quint-grid-1">
                <img src={node.attrs.images[1]} alt="Photo 2" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(1)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quint-grid-2">
                <img src={node.attrs.images[2]} alt="Photo 3" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(2)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quint-grid-3">
                <img src={node.attrs.images[3]} alt="Photo 4" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(3)}>×</button>
                {/if}
            </div>
            <div class="image-wrapper quint-grid-4">
                <img src={node.attrs.images[4]} alt="Photo 5" />
                {#if allowEdit}
                    <button class="remove-button" on:click={() => removePhoto(4)}>×</button>
                {/if}
            </div>
        {/if}
    </div>
    
    {#if allowEdit && layout < 5}
        <button class="add-button" on:click={addPhoto}>+</button>
    {/if}
</NodeViewWrapper>




<style>
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }

    .photo-layout {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 4px;
        aspect-ratio: 2/1;
        border-radius: 12px;
        overflow: hidden;
    }

    /* Single photo */
    .single {
        grid-column: span 4;
        grid-row: span 2;
    }

    /* Two photos */
    .double-left {
        grid-column: span 2;
        grid-row: span 2;
    }
    .double-right {
        grid-column: span 2;
        grid-row: span 2;
    }

    /* Three photos */
    .triple-main {
        grid-column: span 2;
        grid-row: span 2;
    }
    .triple-top {
        grid-column: span 2;
        grid-row: span 1;
    }
    .triple-bottom {
        grid-column: span 2;
        grid-row: span 1;
    }

    /* Four photos */
    .quad-main {
        grid-column: span 2;
        grid-row: span 2;
    }
    .quad-top {
        grid-column: span 2;
        grid-row: span 1;
    }
    .quad-bottom-left {
        grid-column: span 1;
        grid-row: span 1;
    }
    .quad-bottom-right {
        grid-column: span 1;
        grid-row: span 1;
    }

    /* Five photos */
    .quint-main {
        grid-column: span 2;
        grid-row: span 2;
    }
    .quint-grid-1, .quint-grid-2, .quint-grid-3, .quint-grid-4 {
        grid-column: span 1;
        grid-row: span 1;
    }

    .photo-layout-container {
        position: relative;
    }

    .add-button {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .add-button:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    .empty-state {
        grid-column: span 4;
        grid-row: span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1.2rem;
        color: #666;
    }

    .image-wrapper {
        position: relative;
    }

    .remove-button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .remove-button:hover {
        background: rgba(0, 0, 0, 0.8);
    }
</style>
