import { execFileSync } from 'node:child_process'

// 在已打开真实 Codex 会话的 Ego 页面上检查；不导航、不发送、不切换速度。
const spaceId = Number(process.argv[2])
if (!Number.isSafeInteger(spaceId) || spaceId < 1) {
  throw new Error('用法：node scripts/check-real-composer-more.mjs <Ego taskSpace ID>')
}
execFileSync('ego-browser', ['nodejs'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  input: `
const assert = (await import('node:assert/strict')).default;
const task = await taskSpace(${spaceId}), page = task.page('p1');
const trigger = '[data-dsh-composer-slot-overflow-trigger]';
const quota = '[data-slot="conversation.input.right"] [data-openai-codex-quota]';
await page.hover(trigger, {label:'收起额度提示以记录原控件布局'});
if (await page.evaluate(() => document.querySelector('[data-dsh-composer-slot-overflow-trigger]')?.getAttribute('aria-expanded') !== 'true')) await page.click(trigger);
const read = () => page.evaluate(() => {
  const p = document.querySelector('[data-dsh-composer-slot-overflow-open]');
  const controls = [...p.children].filter(e => !e.hasAttribute('data-dsh-composer-overflow-surface') && e.tagName !== 'DIALOG');
  const box = e => {const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
  const tooltip = p.querySelector('[data-openai-codex-quota-tooltip]');
  return {panel:box(p),overflowX:getComputedStyle(p).overflowX,overflowY:getComputedStyle(p).overflowY,
    controls:controls.map(box),fast:box(p.querySelector('[data-openai-codex-fast-mode]').parentElement),
    quota:box(p.querySelector('[data-openai-codex-quota]')),tooltip:tooltip?box(tooltip):null,
    same:!window.__composerMoreOriginalControls || window.__composerMoreOriginalControls.every((e,i)=>e===controls[i]),
    frameZ:getComputedStyle(document.querySelector('[data-dsh-composer-split-frame]')).zIndex};
});
await page.evaluate(() => {const p=document.querySelector('[data-dsh-composer-slot-overflow-open]');window.__composerMoreOriginalControls=[...p.children].filter(e=>!e.hasAttribute('data-dsh-composer-overflow-surface')&&e.tagName!=='DIALOG')});
try {
  const before=await read();
  assert.equal(before.controls.length,3,'应为原始闪电、额度、任务控件');
  assert.equal(before.fast.w,30,'保留速度控件原宽');
  assert.equal(before.quota.w,70,'保留额度控件原宽');
  for(let i=1;i<before.controls.length;i++) {
    const a=before.controls[i-1],b=before.controls[i];
    assert.ok(b.x>=a.x+a.w,'控件应横向排列');
    assert.ok(Math.abs((a.y+a.h/2)-(b.y+b.h/2))<1,'控件应在同一行居中');
  }
  await page.hover(quota,{label:'检查真实额度提示不撑宽菜单'});
  await page.waitForSelector('[data-openai-codex-quota-tooltip]',{state:'visible',timeout:5000});
  const after=await read();
  assert.ok(after.same,'hover 保留原始控件节点');
  assert.equal(after.overflowX,'visible','提示不进入横向滚动区域');
  assert.equal(after.overflowY,'visible','提示不被菜单裁剪');
  assert.ok(Math.abs(after.panel.w-before.panel.w)<1,'hover 不撑宽菜单');
  assert.ok(Math.abs(after.panel.h-before.panel.h)<1,'hover 不撑高菜单');
  assert.ok(after.tooltip.y+after.tooltip.h<=after.quota.y,'提示独立浮在额度控件上方');
  assert.equal(after.frameZ,'21','继续高于分割线');
  console.log({passed:true,panel:after.panel,controlWidths:after.controls.map(e=>e.w),tooltip:after.tooltip});
} finally {
  await page.evaluate(()=>{delete window.__composerMoreOriginalControls});
  await page.hover(trigger,{label:'结束额度悬停检查'});
}
`,
})
