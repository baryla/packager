export default function generateExport(file: any) {
    return (
        `export default function addStyles () {` +
        `const tag = document.createElement('style');` +
        `tag.type = 'text/css';` +
        `tag.appendChild(document.createTextNode(\`${file.code}\`));` +
        `tag.setAttribute('data-src', '${file.path}');` +
        `document.head.appendChild(tag);` +
        `} addStyles();`
    );
}
