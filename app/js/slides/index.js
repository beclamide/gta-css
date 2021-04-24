import styles from 'reveal.js/dist/reveal.css';
import theme from 'reveal.js/dist/theme/black.css';
import monokai from 'reveal.js/plugin/highlight/monokai.css';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.esm'
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm';

const deck = new Reveal({
    plugins: [ Markdown, RevealHighlight ]
});

deck.initialize();