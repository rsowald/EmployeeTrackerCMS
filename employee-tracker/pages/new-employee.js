import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/layout';

export default function NewEmployee() {
    return (
        <Layout>
            <Head>
                <title>Add New Employee</title>
            </Head>
            <h1>New Employee</h1>
            <h2>
                <Link href="/">
                    <a>Back to home</a>
                </Link>
            </h2>
        </Layout>
    )
}