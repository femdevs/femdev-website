// Functions

// Classes
class Util {
    static getTime() {
        return new Date().toLocaleTimeString('en-US', { timeZone: 'EST' })
    }
    static getDate() {
        return new Date().toLocaleDateString(
            'en-US',
            {
                timeZone: 'EST',
                year: "2-digit",
                month: "2-digit",
                day: "2-digit"
            }
        )
    }
    static getFullDate() {
        const date = this.getDate()
        const time = this.getTime()
        return `${date} ${time}`
    }
    static writeClipboard(index) {
        const writeables = [
            "#1",
            "#2",
            "#3",
            "#4",
            "#5"
        ]
        if (index > writeables.length) throw new ReferenceError("Failed To Write: Invalid Index");
        return navigator.clipboard.writeText(writeables[index - 1])
    }
}