export class IdPool {
    private usingIds: string[]
    private idleIds: string[]
    public constructor() {
        this.usingIds = []
        this.idleIds = []
    }
    public genId() {
        let retId: string
        if (this.idleIds.length > 0) retId = `${this.idleIds.pop()}`
        retId = `${this.usingIds.length}`
        this.usingIds.push(retId)
        return retId;
    }
    public disposeId(id: string) {
        let found = this.usingIds.findIndex((v) => v == id)
        if (found >= 0) {
            this.usingIds.splice(found, 1)
            this.idleIds.push(id)
        }
    }

    public dispose() {
        this.usingIds = []
        this.idleIds = []
    }

}