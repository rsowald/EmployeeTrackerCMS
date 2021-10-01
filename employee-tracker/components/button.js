import styles from './button.module.css'

export function DeleteButton() {
    return (
        <button
            type="button"
            className={styles.delete}
        >
            Remove
        </button>
    )
}

export function AddButton() {
    return (
        <button
            type="button"
            className={styles.add}
        >
            Save
        </button>
    )
}