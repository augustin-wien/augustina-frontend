export function formatCredit(credit: number) {
    return (credit / 100).toFixed(2)
}
export function formatDate(date: string) {
    if (!date || date === '') return ''
    return new Date(date).toLocaleString()
}
