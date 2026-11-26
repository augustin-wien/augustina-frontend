export class RandomInput {
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters[randomIndex]
    }

    return result
  }

  static getRandomId(): string {
    const ints = '1234567890'
    let result = 'fl-'

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * ints.length)
      result += ints[randomIndex]
    }

    return result
  }

  static getRandomLongitude(): string {
    const minLongitude = 16.2
    const maxLongitude = 16.6

    return (Math.random() * (maxLongitude - minLongitude) + minLongitude).toFixed(6).toString()
  }

  static getRandomLatitude(): string {
    const minLatitude = 48.1
    const maxLatitude = 48.4

    return (Math.random() * (minLatitude - maxLatitude) + minLatitude).toFixed(6)
  }

  static getRandomEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com']
    return `${this.getRandomString(8)}@${domains[Math.floor(Math.random() * domains.length)]}`
  }

  static getRandomFirstName(): string {
    const firstNames = ['John', 'Jane', 'Alex', 'Chris', 'Taylor']
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]}`
  }

  static getRandomLastName(): string {
    const lastNames = ['Doe', 'Smith', 'Brown', 'Johnson', 'Williams']
    return `${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  static getRandomBoolean(): boolean {
    return Math.random() < 0.5
  }

  static getRandomPhoneNumber(): string {
    return `+1${this.getRandomNumber(1000000000, 9999999999)}`
  }
}

export function formatCredit(credit: number | undefined) {
  if (credit == undefined) {
    return 0
  } else {
    return (credit / 100).toFixed(2).replace('.', ',')
  }
}
export function formatDate(date: string) {
  if (!date || date === '') return ''
  return new Date(date).toLocaleString()
}

// a function to export data as csv
// eslint-disable-next-line
export function exportAsCsv(data: Array<any>[], fileName: string) {
  let csv = ''

  // Quote cells that would otherwise break the row, e.g. an address with a ";" in it
  const escapeCell = (cell: unknown) => {
    const text = cell === null || cell === undefined ? '' : String(cell)

    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  data.forEach((row) => {
    csv += row.map(escapeCell).join(';')
    csv += '\n'
  })

  const anchor = document.createElement('a')
  anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  anchor.target = '_blank'
  anchor.style.visibility = 'hidden'
  anchor.download = `${fileName}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export function transformToFloat(num: number | string): number {
  if (typeof num === 'string') {
    return parseFloat(num.replace(',', '.'))
  }

  if (Number.isInteger(num)) {
    return parseFloat(num.toString())
  } else {
    return num
  }
}
