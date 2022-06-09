# nodejs-express-week6
## LV1：設計五個會員相關 API
- 註冊會員 (取得JWT) `router.post('/user/sign_up')`
- 會員登入 (取得JWT) `router.post('/user/log_in')`
- 重設密碼 (需登入) `router.post('/user/update_password')`
- 取得個人資料 (需登入) `router.get('/user/profile')`
- 更新個人資料 (需登入) `router.patch('/user/profile')`

## LV2：調整第四週 API，都加上登入驗證的 middleware
- 觀看所有貼文 `router.get('/posts')`
- 張貼個人貼文 `router.post('/post')`


## 安裝專案
```
$ git clone git@github.com:cgh20xx/nodejs-express-week6.git
$ cd nodejs-express-week6
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