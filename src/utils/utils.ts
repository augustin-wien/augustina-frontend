export function formatCredit(credit: number) {
    return (credit / 100).toFixed(2).replace('.', ',')
}
export function formatDate(date: string) {
    if (!date || date === '') return ''
    return new Date(date).toLocaleString()
}

// a function to export data as csv
export function exportAsCsv(data: any[], fileName: string) {
    let csv = '';
    data.forEach((row) => {
        csv += row.join(';');
        csv += "\n";
    });

    const anchor = document.createElement('a');
    anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    anchor.target = '_blank';
    anchor.style.visibility = 'hidden'
    anchor.download = `${fileName}.csv`;
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}