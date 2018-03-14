"use strict";

require("dotenv").config();

// ライブラリのインポート。
const express = require("express");
const app = express();
const line_login = require("line-login");
const session = require("express-session");
const session_options = {
    secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
    resave: false,
    saveUninitialized: false
}
app.use(session(session_options));

// 認証の設定。
const login = new line_login({
    channel_id: process.env.LINE_LOGIN_CHANNEL_ID,
    channel_secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
    callback_url: process.env.LINE_LOGIN_CALLBACK_URL,
    prompt: "consent", //既存の承認の有無に関係なく、承認するか尋ねるようになる。
    bot_prompt: "aggressive"//Botの追加をしてもらいやすいように、UIが変わる
});

// サーバー起動設定。
app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening to ${process.env.PORT || 5000}...`);
});

// 認証フローを開始するためのルーター設定。
app.get("/auth", login.auth());

// ユーザーが承認したあとに実行する処理のためのルーター設定。
app.get("/callback", login.callback(
    (req, res, next, token_response) => {
        // 認証フロー成功時
        res.json(token_response);
    },(req, res, next, error) => {
        // 認証フロー失敗時
        res.status(400).json(error);
    }
));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.render(__dirname + "/index");
})