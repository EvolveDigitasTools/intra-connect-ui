import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import styles from './Documentation.module.css'; 

export default function Documentation() {
    const [markdownContent, setMarkdownContent] = useState('');

    useEffect(() => {
        fetch('/docs/IntraConnect_Documentation.md')
            .then(response => response.text())
            .then(text => setMarkdownContent(text));
    }, []);

    return <div className={styles.doc}>
        <ReactMarkdown children={markdownContent} remarkPlugins={[remarkGfm]} />
    </div>
}