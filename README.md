# nodejs-express-week7
## 圖片上傳
- 介接 Imgur 第三方圖床服務。[教學文件](https://israynotarray.com/nodejs/20220517/432259079/)
- 設計一個 /upload 路由，來設計上傳圖片功能，後端得驗證是否符合 2mb 限制、格式支援 jpg、png
- 需通過 isAuth 登入驗證 middleware 才可上傳

## 安裝專案
```
$ git clone git@github.com:cgh20xx/nodejs-express-week7.git
$ cd nodejs-express-week7
$ npm install
```

## 啟動專案
```
$ npm start
```

# Heroku 相關設定(重要)
- server.js 裡面 server 偵聽的 port 需先使用系統環境變數 process.env.PORT
- 需在 package.json 裡面新增 script start 以及 engines (可指定node版本)
```json
{
  "scripts": {
    "start": "node ./bin/www",
  },
  "engines": {
    "node": "16.x"
  }
}
```
## 全域安裝 Heroku CLI (若沒裝過才裝)
```
$ npm install -g heroku
```

## 登入 Heroku
```
$ heroku login
```
## 在 Heroku 建立此專案的雲端主機
```
$ heroku create <herokud的次網域名稱>
```

## 佈署到 Heroku 遠端數據庫
專案若要更新到 Heroku，就要執行此命令。
```
$ git push heroku main 
```

## 到 Heroku 該專案下設定環境變數
到 Settings -> Config Vars 設定資料庫連線字串和密碼 (DB_CONN、DB_PASSWORD)
不用設定 PORT (Heroku 已內建)

## 在瀏覽器打開此專案的 Heroku 網址
```
$ heroku open
```