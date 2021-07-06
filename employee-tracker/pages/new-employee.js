import Link from 'next/link'

export default function NewEmployee() {
    return (
        <>
            <h1>New Employee</h1>
            <h2>
                <Link href="/">
                    <a>Back to home</a>
                </Link>
            </h2>
        </>
    )
}