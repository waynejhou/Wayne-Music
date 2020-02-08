### 啟動階段流程

#### 進入: `main.ts`

* 持有資料:
  * 系統資料（`isMac`、`exePath`）
  * 啟動參數（使用開發伺服器、開發伺服器 port、啟動音樂檔路徑）

#### 啟用 `AppIpc.MainRoute`

作為與 「main 端」與 「renderer 端」之間溝通手段 `Electron.icpMain` 的介面包裝

#### 啟用 `StatusHost`

應用程式的狀態管理
會比 `mainRoute` 晚啟用是因為 各項機能可能需要透過 `mainRoute` 接收一些狀態變更

* electron 執行狀態 callback 包裝
* `SessionCenter`：session 狀態管理及 callback 包裝
* `CommandLineArgsCenter`：「啟動參數」的解析與執行
  * feat: `'command-line-args'``
* ``InfoCenter`：「系統資料」的解析與執行

####  啟用 `CommandSet` 

程式操作的介面，包含

* 解析或取得所需該操作所需資料
* 透過 ipc 傳給 renderer
* 啟用 `AppFactory` 

##### 啟用 `AppFactory`

* 資料的解析運算處理
* 大多數 `Factory` 應該只存在於 `CommandSet` 

#### 啟用 `MenuHost`

應用程式菜單管理

* 包含「主菜單」與「內容菜單」的宣告以及「跳出」
* 其指令透過  `CommandSet` 執行

#### 註冊啟動/關閉相關狀態 callback

* on `electron-ready`
* on `electron-quit`
* ...

####　離開: `main.ts`