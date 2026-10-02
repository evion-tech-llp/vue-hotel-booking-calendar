import { ref, nextTick, type ComponentPublicInstance } from 'vue'

type FocusableEl = Element | ComponentPublicInstance | null

/**
 * Roving-tabindex arrow-key navigation for a flat grid of interactive cells
 * (day cells, time slots, etc.). Consumers lay their cells out as a flat,
 * 0-indexed list and tell the composable how many columns that list wraps at
 * so ArrowUp/ArrowDown can jump by a row.
 *
 * Usage in a template:
 *   const nav = useGridKeyboardNav(() => cellCount.value, { columns: 7, onActivate: selectCell })
 *   <div v-for="(cell, i) in cells" :key="i"
 *        :ref="el => nav.setCellRef(el, i)"
 *        :tabindex="nav.isTabbable(i) ? 0 : -1"
 *        role="button"
 *        @click="selectCell(i)"
 *        @keydown="nav.handleKeydown($event, i)" />
 */
export function useGridKeyboardNav(
    itemCount: () => number,
    options: { columns: number; onActivate: (index: number) => void }
) {
    const focusedIndex = ref(0)
    const cellRefs = ref<FocusableEl[]>([])

    const setCellRef = (el: FocusableEl, index: number) => {
        cellRefs.value[index] = el
    }

    const focusCell = (index: number) => {
        const count = itemCount()
        if (count === 0) return
        const clamped = Math.max(0, Math.min(index, count - 1))
        focusedIndex.value = clamped
        nextTick(() => {
            const target = cellRefs.value[clamped]
            if (!target) return
            const el = '$el' in (target as object) ? (target as ComponentPublicInstance).$el : target
            ;(el as HTMLElement)?.focus?.()
        })
    }

    const isTabbable = (index: number): boolean => index === focusedIndex.value

    const handleKeydown = (event: KeyboardEvent, index: number) => {
        const count = itemCount()
        const { columns } = options

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault()
                focusCell(index + 1)
                break
            case 'ArrowLeft':
                event.preventDefault()
                focusCell(index - 1)
                break
            case 'ArrowDown':
                event.preventDefault()
                focusCell(index + columns)
                break
            case 'ArrowUp':
                event.preventDefault()
                focusCell(index - columns)
                break
            case 'Home':
                event.preventDefault()
                focusCell(index - (index % columns))
                break
            case 'End':
                event.preventDefault()
                focusCell(Math.min(index - (index % columns) + columns - 1, count - 1))
                break
            case 'Enter':
            case ' ':
                event.preventDefault()
                options.onActivate(index)
                break
        }
    }

    return { focusedIndex, setCellRef, focusCell, isTabbable, handleKeydown }
}
