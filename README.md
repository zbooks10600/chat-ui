# Chatbot UI For miibo

このプロジェクトは [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) のフォークです。

オリジナルの作成者は [Mckay Wrigley](https://github.com/mckaywrigley) です。

このフォークは [CTD Networks co.,Ltd](https://ctd.co.jp/) によって資金提供され、特定の機能追加と修正は [Flexsystems Inc.](https://www.flexsystems-inc.com/) によって行われました。

## 追加した機能
- chatbot-uiからmiiboを呼び出せるように機能を追加しました。

## 必要スペック
- CPU：2コア以上
- メモリ：4GB以上（16GB以上を推奨）
- ストレージ：40GB以上（100GB以上を推奨）

## Chatbot UIインストール・セットアップ

### 1. ubuntuインストール

1. ubuntuデスクトップをインストールする  
 ※今回は、バージョン「22.04.4」をインストールする。
2. root権限で作業する

 - root権限に昇格する
 
 ```
 sudo su -
 ```

 - rootと表示されることを確認する
 
 ```
 whoami
 ```
 
 - ```/root/``` に移動する
 
 ```
 cd /root/
 ```


### 2. chatbot-uiクローン
1. アップデートできるパッケージを確認する。
```
sudo apt update
```

2. 必要なパッケージをインストールする。（Git、Curl）
```
sudo apt install git curl
```

3. chatbot-uiをクローンする
```
git clone https://github.com/Flexsystems-inc/chatbot-ui-for-miibo.git
```

### 3. Node.jsインストール
1. nvmをインストールする。  
※最新のnvmを取得する際は、v0.39.7 の部分を更新すること
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

2. 設定更新をする。
```
source ~/.bashrc
```

3. Node.jsをインストールする。
```
nvm install --lts --latest-npm
```

4. Next.jsをインストールする。
```
cd /root/chatbot-ui-for-miibo/
```
```
npm install @jridgewell/sourcemap-codec @rollup/plugin-terser workbox-background-sync --save
```
```
npm install next@latest --save
```

5. Node.jsをビルドする。
```
cd /root/chatbot-ui-for-miibo/
```
```
npm run build
```

### 4. Docker Engineインストール
1. 古いバージョンのDockerを削除する。
```
sudo apt remove docker docker-engine docker.io containerd runc
```

2. パッケージリストを更新し、Dockerインストール用の依存関係をインストールする。
```
sudo apt update
```
```
sudo apt install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

3. Docker公式のGPGキーを追加する。
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4. Dockerのリポジトリを追加する。
```
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

5. パッケージリストを更新し、Docker Engineをインストールする。
```
sudo apt update
```
```
sudo apt install docker-ce docker-ce-cli containerd.io
```

6. `docker.sock` の実行グループに権限を割り当てる。
```
sudo chown $(whoami) ///var/run/docker.sock
```

7. Dockerが正しくインストールされたかを確認する。
```
sudo docker --version
```

### 5. 依存関係インストール
1. ディレクトリを移動する。
```
cd /root/chatbot-ui-for-miibo
```

2. 依存パッケージのインストールする。
```
npm install
```

### 6. Homebrewインストール
1. 必要なパッケージをインストールする。
```
sudo apt install build-essential procps file
```

2. Homebrewをインストールする。  
 - root権限からユーザに戻る。
```
[ "$(whoami)" = "root" ] && cd / && exit
```
 - ユーザ権限でHomebrewインストールを実行する。
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
 - ※インストールが完了すると下記のメッセージが出力される
 
 ```ログ
 ==> Installation successful!

 ==> Homebrew has enabled anonymous aggregate formulae and cask analytics.
 Read the analytics documentation (and how to opt-out) here:
   https://docs.brew.sh/Analytics
 No analytics data has been sent yet (nor will any be during this install run).

 ==> Homebrew is run entirely by unpaid volunteers. Please consider donating:
   https://github.com/Homebrew/brew#donations

 ==> Next steps:
 - Run these two commands in your terminal to add Homebrew to your PATH:
    (echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> /home/$(whoami)/.bashrc
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
 - Install Homebrew's dependencies if you have sudo access:
    sudo apt-get install build-essential
  For more information, see:
    https://docs.brew.sh/Homebrew-on-Linux
 - We recommend that you install GCC:
    brew install gcc
 - Run brew help to get started
 - Further documentation:
    https://docs.brew.sh
 ```

3. インストールメッセージの「Next steps」を実行する。
 - PATHにHomebrewを追加します。
    - root権限
    ```
    sudo su -
    ```
    ```
    (echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> /$(whoami)/.bashrc
    ```
    ```
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    ```

    - ユーザ権限
    ```
    [ "$(whoami)" = "root" ] && cd / && exit
    ```
    ```
    (echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> /home/$(whoami)/.bashrc
    ```
    ```
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    ```

4. Homebrewの依存パッケージをインストールする。
```
sudo apt-get install build-essential
```

5. GCCをインストールする。
```
[ "$(whoami)" = "root" ] && cd / && exit
```
```
brew install gcc
```

4. バージョンを確認して、pathが通っていることを確認する。
```
sudo su -
```
```
brew --version
```
```
gcc --version
```

### 7. Supabase CLIインストール
1. Supabase CLIをインストールする。
```
[ "$(whoami)" = "root" ] && cd / && exit
```
```
brew install supabase/tap/supabase
```

2. Supabaseを起動する。
```
sudo su -
```
```
cd /root/chatbot-ui-for-miibo
```
```
 supabase init --force
```
```
supabase start
```

3. 設定値を取得する。
```
supabase status
```
- `API URL`
- `anon key`
- `service_role key`

### 8. 環境設定
1. `.env.local`ファイルを作成する。
```
cd /root/chatbot-ui-for-miibo
```
```
cp .env.local.example .env.local
```

2. `.env.local`ファイルに設定を追加する。
```
vi .env.local
```


- `NEXT_PUBLIC_SUPABASE_URL`：上記6-3の`API URL`のIP部分を自身のIPに置き換えて設定  
※nginxでのURLプロキシ連携していない場合は必須。  
※URLプロキシ連携している場合は、空欄```NEXT_PUBLIC_SUPABASE_URL=```のままで良い。
```例
# Supabase Public
NEXT_PUBLIC_SUPABASE_URL=http://XXX.XXX.XXX.XXX:54321`
```

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：上記7-3の`anon key`を設定
- `SUPABASE_SERVICE_ROLE_KEY`：上記7-3の`service_role key`を設定


### 9. シェルスクリプトによる自動起動準備
**サーバー内でcronを利用した設定になります。**

1. start-chatbot.sh の生成  
 - ヒアドキュメント形式で必要な設定を書き込む

    ```
    sudo bash -c "cat << EOF > /$(whoami)/start-chatbot.sh
    #\!/bin/bash

    # Ensure the script runs with the user's environment
    export PATH=$PATH:/home/linuxbrew/.linuxbrew/bin

    # Change ownership of the Docker socket
    chown $(whoami) /var/run/docker.sock

    # Navigate to the chatbot directory
    cd /$(whoami)/chatbot-ui-for-miibo

    # Start the chatbot
    npm run chat:start &"    
    ```

 - 「```\```」を消す
 
    ```
    sudo sed -i 's/\\//' /$(whoami)/start-chatbot.sh
    ```

 - 正しく書き込まれたことの確認
 
    ```
    sudo cat /$(whoami)/start-chatbot.sh
    ```

2. cron設定

 - crontabコマンドで編集を呼び出す
    ```
    sudo crontab -e
    ```

 - 最終行に以下をコピーする
    ```
    @reboot sleep 20 && sh /root/start-chatbot.sh
    ```

### 10. Nginxの導入・設定
1. Nginxのインストール
    ```
    sudo apt install nginx
    ```
2. Nginxの設定

 - proxy_pathを利用して3000ポートを80ポートにリダイレクト。
    ```
    sudo nano /etc/nginx/sites-available/default
    ```
    ```
        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }
        ↓
        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                # try_files $uri $uri/ =404;

                proxy_pass http://127.0.0.1:3000/;
                proxy_http_version 1.1;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

        location /_next/static {
            alias /root/chatbot-ui-for-miibo/.next/static;
            add_header Cache-Control "public, max-age=3600, immutable";
        }
    ```

 - nginxユーザーをrootに設定
    ```
    sudo nano /etc/nginx/nginx.conf
    ```
    ```
    user www-data
    ↓
    user root
    ```
 
 - 正しく書き込まれたことの確認
    ```
    sudo nginx -t
    ```

 - nginxサーバーを再起動
    ```
    sudo systemctl restart nginx
    ```

### 11. Chatbot UI 起動
   ```
   sh /root/start-chatbot.sh
   ```

## miiboの設定

### エージェントの作成～公開
株式会社miiboが作成している公式サイトを参考に、miiboにてエージェントの作成、公開及びAPIの有効化を行ってください。
- エージェントの作成
- エージェントの公開
- APIの有効化

## Chatbot UIの設定
### miiboとの接続

"+ New Model"の接続情報に以下値を設定してください。

`Name`：`miibo`と設定
※miibo以外の値を設定するとmiiboと接続できませんのでご注意ください。

`Model ID`：miiboの"APIの設定"に記載してある`AGENT ID`の値を設定

`Base URL`：`https://api-mebo.dev/api`と設定

`API Key`：miiboの"APIの設定"に記載してある`API KEY`の値を設定

`Max Context Length`：使用しません


## その他

その他情報はオリジナルのリポジトリである [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) をご確認ください。

## 問合せ先

Mckay様への連絡 [Twitter/X](https://twitter.com/mckaywrigley)

フレックシステムズ株式会社への連絡 [Contact Us](https://www.flexsystems-inc.com/contact/)
