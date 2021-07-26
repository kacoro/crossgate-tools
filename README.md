# CrossGate Tools
一个魔力宝贝的看图工具。

使用了electorn  react-redux typescript material jimp等实现


# 开发
```
npm run start
```

# 打包
```
npm run build
```


# 故障

## 1.运行时提示

> Electron failed to install correctly, please delete node_modules/electron and try installing again


```
# 设置系统环境变量
ELECTRON_MIRROR="https://cdn.npm.taobao.org/dist/electron/"
```
```
rm -rf node_modules/electron
cnpm install --verbose electron
```

## 2.开发模式下会提示
> 'electron' 不是内部或外部命令，也不是可运行的程序
```
rm -rf node_modules/electron
cnpm install --verbose electron
```



