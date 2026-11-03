/* 教师工作台 — 交互逻辑
   说明：当前云服务后端暂未开通，上传/分析/汇总的数据先在本机预览与暂存；
   一旦云服务开通并填入 window.CLOUD_CONFIG，uploadFiles()/analyzeWithAI() 会自动切到云端。 */

(function () {
  'use strict';

  /* ---------- 0. 插图收藏库（跨页 localStorage 共享，科普页↔工作台） ---------- */
  window.IllustrationLibrary = {
    KEY: 'tw_illustrations_v1',
    load() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { return []; } },
    save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) {} },
    add(item) {
      const list = this.load();
      const rec = Object.assign({ id: 'ill_' + Date.now(), ts: new Date().toISOString() }, item);
      list.unshift(rec); this.save(list); return rec;
    },
    remove(id) { this.save(this.load().filter(x => x.id !== id)); },
    allTags() { const s = new Set(); this.load().forEach(it => (it.tags || []).forEach(t => s.add(t))); return Array.from(s); },
    setTags(id, tags) { const l = this.load(); const it = l.find(x => x.id === id); if (it) { it.tags = tags; this.save(l); } }
  };

  /* ---------- 1. 总目录：滚动高亮 ---------- */
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const sections = tocLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- 2. 模块内标签页 ---------- */
  document.querySelectorAll('.tabs').forEach(group => {
    const tabs = Array.from(group.querySelectorAll('.tab'));
    const panels = tabs.map(t => document.getElementById(t.dataset.target));
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        panels.forEach(p => p && p.classList.remove('active'));
        t.classList.add('active');
        panels[i] && panels[i].classList.add('active');
      });
    });
  });

  /* ---------- 3. 模板：复制 / 打印 ---------- */
  // 把当前填写的值同步到属性/文本，保证打印与复制能带上已填内容
  function syncValues(node) {
    node.querySelectorAll('input,textarea,select').forEach(el => {
      if (el.tagName === 'TEXTAREA') { el.textContent = el.value; }
      else if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) el.setAttribute('checked', 'checked'); else el.removeAttribute('checked');
      } else { el.setAttribute('value', el.value); }
    });
  }

  window.printTemplate = function (id) {
    const node = document.getElementById(id);
    if (!node) return;
    syncValues(node);
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>教学模板</title><style>'
      + 'body{font-family:"Noto Sans SC",system-ui;padding:32px;color:#1f2a37;line-height:1.7}'
      + 'h2{color:#134e63;margin-top:18px}h3{color:#1f6f8b}label{display:block;font-weight:600;margin:12px 0 4px}'
      + 'textarea,input{width:100%;border:1px solid #ccc;border-radius:6px;padding:8px;font:inherit}'
      + 'textarea{min-height:60px}.tbl{width:100%;border-collapse:collapse;margin:10px 0}'
      + '.tbl th,.tbl td{border:1px solid #ccc;padding:6px 8px}th{background:#eef3f9}'
      + 'hr{border:0;border-top:1px solid #eee;margin:18px 0}</style></head><body>'
      + '<h2>硬糖的地理芝士 · 教学模板</h2>' + node.innerHTML
      + '<scr' + 'ipt>window.onload=function(){window.print()}<\/scr' + 'ipt></body></html>');
    w.document.close();
  };

  window.copyTemplate = function (id) {
    const node = document.getElementById(id);
    if (!node) return;
    let out = '';
    node.querySelectorAll('.field').forEach(f => {
      const lab = f.querySelector('label');
      const ctrl = f.querySelector('input,textarea,select');
      if (lab && ctrl) out += '• ' + lab.textContent.trim() + '：' + (ctrl.value || '（空）') + '\n';
    });
    node.querySelectorAll('table.tbl').forEach(t => {
      out += '\n【表格】\n';
      t.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('th,td')).map(c => {
          const ctrl = c.querySelector('input,textarea,select');
          return ctrl ? (ctrl.value || '') : c.textContent.trim();
        });
        out += cells.join(' | ') + '\n';
      });
    });
    navigator.clipboard.writeText(out.trim()).then(() => {
      alert('模板内容已复制（含已填写内容），可粘贴到文档中。');
    }).catch(() => alert('复制失败，请手动选择文本复制。'));
  };

  /* ---------- 3c. 导出 Word（.doc） ---------- */
  window.exportDoc = function (id, filename) {
    const node = document.getElementById(id);
    if (!node) return;
    if (typeof syncValues === 'function') syncValues(node);
    const title = filename || '文档';
    const html = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" '
      + 'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      + '<head><meta charset="utf-8"><title>' + title + '</title>'
      + '<style>body{font-family:"Noto Sans SC",system-ui;padding:28px;color:#1f2a37;line-height:1.7}'
      + 'h2{color:#134e63}h3{color:#1f6f8b}label{display:block;font-weight:600;margin:12px 0 4px}'
      + 'textarea,input{width:100%;border:1px solid #ccc;border-radius:6px;padding:8px;font:inherit}'
      + 'textarea{min-height:60px}.tbl{width:100%;border-collapse:collapse;margin:10px 0}'
      + '.tbl th,.tbl td{border:1px solid #ccc;padding:6px 8px}th{background:#eef3f9}</style></head><body>'
      + '<h2>硬糖的地理芝士 · ' + title + '</h2>' + node.innerHTML + '</body></html>';
    const blob = new Blob(['﻿', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = title + '.doc';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ---------- 3b. 学期进度表：动态增行 ---------- */
  window.addSemesterRow = function () {
    const tb = document.querySelector('#semTable tbody');
    if (!tb) return;
    const n = tb.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td><input value="' + n + '"></td>'
      + '<td><input placeholder="起止日期"></td>'
      + '<td><input placeholder="教学内容"></td>'
      + '<td><input placeholder="课时"></td>'
      + '<td><input></td>'
      + '<td><button class="btn ghost sm" type="button" onclick="this.closest(\'tr\').remove()">删</button></td>';
    tb.appendChild(tr);
  };

  /* ---------- 4. 灵感速记（本机暂存，云端开通后可同步） ---------- */
  const inspireBox = document.getElementById('inspireInput');
  const inspireSave = document.getElementById('inspireSave');
  const inspireMsg = document.getElementById('inspireMsg');
  const INSPIRE_KEY = 'tw_inspire_v1';

  function loadInspire() {
    try { return JSON.parse(localStorage.getItem(INSPIRE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  if (inspireSave && inspireBox) {
    inspireSave.addEventListener('click', () => {
      const v = inspireBox.value.trim();
      if (!v) return;
      const list = loadInspire();
      list.unshift({ t: v, ts: new Date().toISOString() });
      localStorage.setItem(INSPIRE_KEY, JSON.stringify(list.slice(0, 200)));
      inspireBox.value = '';
      if (inspireMsg) inspireMsg.textContent = '已暂存到本机（云端开通后可同步到云）。共 ' + list.length + ' 条灵感。';
    });
  }

  /* ---------- 5. 上传 / 分析 / 汇总中心 ---------- */
  const CLOUD = window.CLOUD_CONFIG || null;   // 云服务开通后由 index.html 注入
  const drop = document.getElementById('drop');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const typeSel = document.getElementById('contentType');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const analysisOut = document.getElementById('analysisOut');
  const summarizeBtn = document.getElementById('summarizeBtn');

  let pendingFiles = [];   // {name,size,type}

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function renderFiles() {
    if (!fileList) return;
    fileList.innerHTML = '';
    if (!pendingFiles.length) {
      fileList.innerHTML = '<div class="empty-hint">还没有添加文件。拖拽或点击左侧区域上传。</div>';
      return;
    }
    pendingFiles.forEach((f, i) => {
      const el = document.createElement('div');
      el.className = 'fileitem';
      el.innerHTML =
        '<div class="fi-ic">📄</div>'
        + '<div class="fi-meta"><div class="fi-name">' + escapeHtml(f.name) + '</div>'
        + '<div class="fi-sub">' + fmtSize(f.size) + ' · ' + (f.cat || '未分类') + '</div></div>'
        + '<span class="pill pending">待云端</span>'
        + '<button class="btn ghost sm" data-i="' + i + '">移除</button>';
      el.querySelector('button').addEventListener('click', () => {
        pendingFiles.splice(i, 1); renderFiles();
      });
      fileList.appendChild(el);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function addFiles(fileObjects) {
    const cat = typeSel ? typeSel.value : '未分类';
    Array.from(fileObjects).forEach(f => {
      pendingFiles.push({ name: f.name, size: f.size, type: f.type, cat, file: f });
    });
    renderFiles();
  }

  if (drop && fileInput) {
    drop.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => addFiles(e.target.files));
    ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  }

  /* 云端上传（开通后启用） */
  async function uploadToCloud(item) {
    if (!CLOUD || !CLOUD.cloud) throw new Error('cloud-not-ready');
    // 预留接口：cloud.storage.upload(...)
    return CLOUD.cloud.storage.upload({ file: item.file, folder: 'teacher/' + item.cat });
  }

  /* AI 分析 / 汇总（开通后启用云端 LLM；当前给出结构提示） */
  async function analyzeWithAI(mode) {
    if (!pendingFiles.length) {
      analysisOut.textContent = '请先上传至少一个文件，再执行' + (mode === 'summarize' ? '汇总' : '分析') + '。';
      return;
    }
    if (!CLOUD || !CLOUD.cloud) {
      // 云端未开通：给出清晰的待启用提示 + 本地可做的整理
      const names = pendingFiles.map(f => '· ' + f.name + '（' + f.cat + '）').join('\n');
      analysisOut.textContent =
        '【云端 AI ' + (mode === 'summarize' ? '汇总' : '分析') + ' 待启用】\n'
        + '当前已识别 ' + pendingFiles.length + ' 个文件：\n' + names + '\n\n'
        + '云服务开通后，这里将调用云端大模型，自动提取要点、'
        + (mode === 'summarize' ? '按模块生成汇总报告与可复用知识卡片。' : '给出改进建议、评价维度与教研启发。')
        + '\n（开通前数据仅在本机预览，不会上传。）';
      return;
    }
    // 开通后：调用 cloud.llm.chat(...)
    analysisOut.textContent = '正在调用云端大模型' + (mode === 'summarize' ? '汇总' : '分析') + '…';
    try {
      const res = await CLOUD.cloud.llm.chat({
        messages: [{ role: 'user', content: (mode === 'summarize' ? '请汇总以下教学资料：' : '请分析以下教学资料并给出建议：') + pendingFiles.map(f => f.name).join('、') }]
      });
      analysisOut.textContent = res.text || JSON.stringify(res);
    } catch (e) {
      analysisOut.textContent = '云端调用失败：' + e.message;
    }
  }

  if (analyzeBtn) analyzeBtn.addEventListener('click', () => analyzeWithAI('analyze'));
  if (summarizeBtn) summarizeBtn.addEventListener('click', () => analyzeWithAI('summarize'));

  renderFiles();

  /* ---------- 6. 暴露云端初始化入口（开通后由 index.html 调用） ---------- */
  window.initTeacherCloud = function (publicConfig) {
    window.CLOUD_CONFIG = { publicConfig, cloud: null };
    // 云端 SDK 初始化在云服务开通、拿到 publicConfig 后在此补全
    console.log('[教师工作台] 已接收云端配置，待初始化云 SDK。');
  };
})();
