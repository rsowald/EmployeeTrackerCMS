import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/layout';
import { AddButton } from '../components/button';

export default function Adding() {
    return (
        <Layout>
            <Head>
                <title>Add</title>
            </Head>
            <nav>
                <Link href="/">
                    <a>Back to home</a>
                </Link>
            </nav>
            <h1>Building Your Business</h1>
            <h2>Add An Employee</h2>
            <AddButton />
            <h2>Add A Role</h2>
            <h2>Add A Department</h2>
        </Layout>
    )
}