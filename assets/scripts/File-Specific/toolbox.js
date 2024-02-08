// Functions

// Classes
class Util {
    static getTime = () => Intl.DateTimeFormat('en-US', { timeZone: 'EST' }).format()
    static getDate = () => Intl.DateTimeFormat('en-US', { timeZone: 'EST', year: "2-digit", month: "2-digit", day: "2-digit" }).format()
    static getFullDate = () => `${Util.getDate()} ${Util.getTime()}`
    static writeClipboard(index) {
        const writeables = new Map()
            .set(1, "#1")
            .set(2, "#2")
            .set(3, "#3")
            .set(4, "#4")
            .set(5, "#5")
        if (index > writeables.size) throw new ReferenceError("Failed To Write: Invalid Index");
        return navigator.clipboard.writeText(writeables.get(index))
    }
}