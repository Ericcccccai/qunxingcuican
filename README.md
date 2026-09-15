# 反光板不是王座 · 三人事故备忘录

第 2 版：一块反光板，两位自封主角，三个小游戏。你可以恋爱，也可以直接下班。

原创中文熟人荒诞喜剧。yqc 爱抢主角、催返图、反复挑图又不发；zzc 的“借一点地方”会膨胀成入住，“就看一张”会吞掉别人一整首歌。人物偶尔认真，但不会在结尾完成一键性格整改。

所有角色都是成年人。yqc、zzc 是虚构角色代号，情节、对话与恋爱发展均为创作，不是事实记录。男 coser 穿女装是正常爱好，笑点来自行为与反应。

## 开始玩

需要 Node.js 22 或更新版本。在本目录运行：

```sh
npm run dev
```

打开 http://127.0.0.1:4173 。按 Control+C 关闭服务。游戏没有运行依赖，不需要安装软件包。不要直接双击 HTML；浏览器通常不允许本地文件加载脚本模块。

第 2 版重写了剧情并加入小游戏状态。第 1 版存档不再适用，请重新开始；存档页会明确提示，没有旧版迁移逻辑。

## 这一版有什么

六章、六种场景：天台摄影棚、客厅、生日布景、漫展休息室、KTV、夜宵面馆。

三套角色造型会随剧情自动切换：舞台服、公主女装 cos、日常装。三位角色各有三种形象，来自三张同身份立绘图集，在画面中分别显示。女装版本包括 yqc 的冷色蕾丝裙与 zzc 的红白裙装、金色肩甲。人物脸型、发色与画风保持一致。

三种结局：恋爱可以，返图另算；两个人，一件超大行李；本群不提供售后。共同剧情的六次对话选择记录相处倾向，开放相应个人支线。独立／友情始终可选，在个人支线也能拒绝恋爱。

预计首轮约 15 至 20 分钟，取决于阅读速度和小游戏尝试次数。没有强制等待，小游戏都可跳过。

## 三个小游戏

| 名称 | 操作 | 结果 |
| --- | --- | --- |
| 主角捕获实验 | 光点进入金色合焦区时按快门，共三张 | 命中次数影响两人如何评价这组照片 |
| 客厅领土回收战 | 选物品、旋转、点击格子放入行李箱；保留右侧通道 | 三件物品归箱或交给 zzc 处理 |
| 返图失忆症 | 翻牌寻找四对相同照片，不限时 | 配对轮数影响“人类缓存”的评价 |

每个游戏都有重试或重新整理、跳过路径。完成或跳过会产生不同的剧情反馈，并记录在结尾的事件单里，不扣除恋爱资格。进行中的射击次数、已放物品、翻开的照片与配对记录都会自动保存。关闭小游戏弹窗后可以手动存档；重开游戏时继续剩余步骤。抓拍的移动光点会从当前剩余轮次重新开始。

## 阅读、存档和音乐

点击对话框或按空格继续，数字键 1、2、3 选择。小游戏通过屏幕按钮操作，也可以 Tab 切换焦点并使用空格或回车。

支持自定义名字、历史记录、自动阅读、三个手动存档、自动继续、重新开始。自动阅读遇到选择或小游戏会暂停，页面进入后台也会暂停。

两首原创合成器纯音乐：backstage 约 74 秒，afterhours 约 87 秒。无歌词、无配音，不含第三方歌曲或采样。点击开始／继续后以低音量播放，右侧“音乐”按钮随时开关，菜单内可调音量。夜宵场景换成较舒缓的第二首；切到后台暂停，返回后按原设置继续。音乐开关与音量会保存在当前浏览器。

游戏美术与音乐都随项目提供，不依赖远程素材服务。在线 Noto Serif SC 不可用时采用设备中文字体。

存档只保存在当前浏览器。更换设备、清除浏览器数据或隐私设置可能使进度丢失。

## 验证与构建

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

最后一个命令用于预览 dist；若开发服务已占用 4173，先关闭它。14 项自动测试覆盖剧情路线、选择、存档、三个小游戏的真实规则与中途保存。共同对话的所有 729 组选择及由此开放的结局，共 2,253 条路径均可结束；小游戏的成败及跳过规则分别验证。

## 发布到 GitHub Pages

目标仓库：[Ericcccccai/yqczzc](https://github.com/Ericcccccai/yqczzc)。本地目录已经连接 origin，地址为 git@github.com:Ericcccccai/yqczzc.git，分支为 main。当前只准备本地提交，尚未推送或公开发布。

### 1. 开启 Pages 发布源

打开 [仓库 Pages 设置](https://github.com/Ericcccccai/yqczzc/settings/pages)。在 Build and deployment 的 Source 中选择 GitHub Actions。此项目自带部署流程，不需要再创建 GitHub 建议的模板。

如果免费个人账户的私有仓库无法启用 Pages，可使用公开仓库，或支持私有仓库 Pages 的付费方案。仓库可见性由你决定。

### 2. 首次上传代码并发布

在终端执行：

```sh
cd /Users/caizhehao/Documents/Codex/2026-09-14/yqc-zzc-galgame/outputs/game
git push -u origin main
```

本地提交已经准备好。推送后，GitHub 自动运行测试、构建并部署。不需要上传 dist，也不需要创建 gh-pages 分支。

### 3. 查看结果

打开 [Actions](https://github.com/Ericcccccai/yqczzc/actions)，进入 Publish game to GitHub Pages。等待 deploy 完成并显示绿色通过标记，查看运行页面给出的站点链接。

默认站点地址预计为 [https://ericcccccai.github.io/yqczzc/](https://ericcccccai.github.io/yqczzc/)。发布完成前，该地址可能显示 404。最终以 Settings → Pages 或部署运行中显示的链接为准。

如果 Pages 设置要等首次推送后才能操作，先执行上面的推送，然后选择 GitHub Actions，再到 Actions 中打开 Publish game to GitHub Pages → Run workflow → 选择 main → Run workflow。

### 4. 后续更新

修改并检查游戏后，在同一目录执行：

```sh
npm test
npm run build
git add .
git commit -m "Update game"
git push
```

每次向 main 推送都会自动更新站点。仅希望重跑部署时，可在 Actions 中手动 Run workflow。

### 出错时看哪里

如果部署提示找不到 Pages 站点，先检查 Source 是否为 GitHub Actions，再重新运行。若提示 Permission denied (publickey)，检查当前终端使用的 GitHub SSH 身份；本次准备时 SSH 读取仓库已成功。如果流程成功但短时间出现 404，使用运行页面给出的链接并稍后刷新。

音乐、人物、场景和脚本都使用相对路径，适配 /yqczzc/ 子目录。部署方式依据 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。音乐启动参考 [MDN 的 play 方法说明](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| index.html、style.css | 界面、桌面和手机排版 |
| story.js | 剧情、场景、服装、选择及结局 |
| engine.js | 状态推进、关系条件、存档和小游戏结果 |
| minigames.js | 三个小游戏的可测试规则及状态校验 |
| minigame-ui.js | 游戏画面与操作 |
| music.js | 音乐播放、开关、音量和前后台管理 |
| app.js | 页面渲染与菜单、存读档 |
| assets | 所有美术与两首 MP3 |
| scripts | 预览、构建、测试和可重复的配乐制作脚本 |

美术使用内置 imagegen 实际生成，并转换为 WebP。没有使用 CLI 图片生成。完整提示词与身份参考关系见 ART-PROMPTS.md。

配乐已经提供成品，构建不需要重生成。仅在修改配乐时运行 scripts/create-music.py，需要 NumPy 和 ffmpeg；乐句、和弦与音色合成规则都在脚本中，不读取外部歌曲。
