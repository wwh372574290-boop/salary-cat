// ====================================================
// Service Worker — 小猫咪工资计算器
// 修改 CACHE_VERSION 后 push，所有用户下次打开自动更新
// ====================================================
var CACHE_VERSION = 'v1.1.1';
const CACHE_NAME = 'salary-cat-' + CACHE_VERSION;

const CACHED_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// 安装：预缓存资源
self.addEventListener('install', event => {
  self.skipWaiting(); // 立即激活新版本
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHED_FILES))
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('salary-cat-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // 立即接管所有已打开页面
  );
});

// 请求拦截：网络优先，失败走缓存（确保每次都能拿到最新版）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功则同时更新缓存
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // 离线时走缓存
  );
});