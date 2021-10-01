import { DeleteButton } from '../components/button';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/layout';

export default function Removing() {
    return (
        <Layout>
            <Head>
                <title>Remove</title>
            </Head>
            <h1>Pruning Your Business</h1>
            <h2>Remove An Employee</h2>
            <DeleteButton />
            <h2>Remove A Role</h2>
            <h2>Remove A Department</h2>
        </Layout>
    )
}