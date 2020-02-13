### React 觀念撇清

不像是傳統 GUI 使用法

不是「創建一個元件，並與它互動」

而是「定義一個元件，在何種狀態時，會長整樣」元件本身的建立與創建交給 React DOM 處理，它會把這部分最佳化，減少應用程式負擔

使用React優點：運作順暢（減少不必要的元件變更）

使用React缺點：起動較慢（初始化React DOM的時間，大多數元件創建是由本地 JS創建而不是從html檔案加載的DOM）

### `AppView`

所有的 React Component 都在這個 namespace 之下

### React hook 解釋

* useState：會影響顯示的變數
  * 必須在useEffect與Html5事件的scope中setState，否則不會re-render
* useRef：不會影響顯示的變數
  * 不會觸發re-render
  * 要記得 .current
* useEffect：即上面所提到，要讓setState觸發re-render的地方

### MVVM 變體使用範例

Model <=> ViewModel <=> View

* Model：真正在做事的地方
* View：真正在顯示的地方(React Component)
* ViewModel：View 與 Model之間的緩衝層
* useBind：連結View與ViewModel的東西 

```ts
export function useBind<T>(propName: string, source:INotifyPropChanged) {
    // 建立一個流程，當source提醒說property變了，去取用最新的數值
    const [prop, setProp] = useState(source[propName] as T)
    useEffect(() => {
        function update(sender: any, args: PropertyChangedEventArgs) {
            if (args.propName == propName) setProp(source[propName])
        }
        source.onPropChanged.do(update)
        return () => {
            source.onPropChanged.remove(update)
        }
    })
    return prop
}
```

```tsx
// Player 的 Props
export class PlayerProps {
    // bind 數值的 ViewModel
    dataContext: BaseViewModel
}

// Player 的 Component
export const Player: React.FC<PlayerProps> = (props) => {
    return (
        <div id="root" className="player container" >
            <div id="metadata" className="player">
                <div className="player metadata">
                    {useBind<string>("title", dataContext)}
                </div>
                <div className="player metadata">
                    {useBind<string>("album", dataContext)}
                </div>
            </div>
        </div>
    )
}
```

```typescript
export class BaseViewModel implements INotifyPropChanged {
    public onPropChanged: IEventHandler<PropertyChangedEventArgs>
    public constructor() {
        this.onPropChanged = new EventHandler()
    }
    // 提醒變動
    protected notifyPropChange(propName: string) {
        this.onPropChanged.invoke(this, new PropertyChangedEventArgs(propName))
    }
}

export class AudioViewModel extends BaseViewModel{
    private audio: AudioModel
    public constructor(audio: AudioModel){
        // 在新的音訊載入完畢時提醒
        audio.audioLoaded.do((sender, current) => {
            this.notifyPropChange("title");
            this.notifyPropChange("album");
        })
    }
    public get title() {
        if (this.audio.current.title)
            return this.audio.current.title
        return "Unknow Title"
    }
    public get album() {
        if (this.audio.current.album)
            return this.audio.current.album
        return "Unknow aAbum"
    }
}
```

