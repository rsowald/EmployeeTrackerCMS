import styles from './layout.module.css';
import Link from 'next/link';

export default function Layout({ children }) {
    return <div className={styles.container}>
        <nav>
            <Link href="/">
                <a>Back to home</a>
            </Link>
        </nav>
        {children}
    </div>
}