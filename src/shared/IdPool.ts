export class IdPool {

    public constructor() {
        this.usingIds = []
        this.idleIds = []
    }
    public genId() {
        if (this.idleIds.length > 0) return this.idleIds.pop()
        const ret = this.usingIds.length
        this.usingIds.push(ret)
        return ret;
    }
    public disposeId(id: number) {
        let found = this.usingIds.findIndex((v) => v == id)
        if(found>=0){
            this.usingIds.splice(found,1)
            this.idleIds.push(id)
        }
    }

    public dispose(){
        this.usingIds = []
        this.idleIds = []
    }
    private usingIds: number[]
    private idleIds: number[]
}