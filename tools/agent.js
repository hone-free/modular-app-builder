import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const ROOT = process.cwd();
const BACKUP_DIR = path.resolve(ROOT, '../modular-app-builder-backups');
const BRANCH = 'main';

function run(command, args = [], options = {}) {
  try {
    const output = execFileSync(command, args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit'
    });
    return typeof output === 'string' ? output.trim() : '';
  } catch (error) {
    if (options.allowFailure) return null;
    throw error;
  }
}

function git(...args) {
  return run('git', args, { silent: true });
}

async function update() {
  console.log('\n=== Modular App Builder Agent ===\n');

  if (git('branch', '--show-current') !== BRANCH) {
    throw new Error('عامل فقط روی شاخه main اجرا می‌شود.');
  }

  if (git('status', '--porcelain')) {
    throw new Error('تغییرات ثبت‌نشده وجود دارد. ابتدا آن‌ها را Commit یا ذخیره کن.');
  }

  console.log('۱. بررسی نسخه GitHub...');
  run('git', ['fetch', 'origin']);

  const [ahead, behind] = git(
    'rev-list', '--left-right', '--count', 'HEAD...origin/main'
  ).split(/\s+/).map(Number);

  if (behind === 0) {
    console.log('نسخه محلی به‌روز است؛ تغییری برای دریافت وجود ندارد.');
    return;
  }

  if (ahead > 0) {
    throw new Error('نسخه محلی و GitHub هر دو تغییر دارند؛ ابتدا باید اختلاف بررسی شود.');
  }

  console.log('\n۲. تغییرات نسخه جدید:\n');
  run('git', ['log', '--oneline', 'HEAD..origin/main']);
  console.log('\nآمار فایل‌های تغییرکرده:\n');
  run('git', ['diff', '--stat', 'HEAD..origin/main']);

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question('\nآیا دریافت و نصب این نسخه را تأیید می‌کنی؟ (yes/no): ');
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('عملیات لغو شد؛ هیچ تغییری اعمال نشد.');
    return;
  }

  console.log('\n۳. تهیه بکاپ...');
  mkdirSync(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = path.join(BACKUP_DIR, `backup-${stamp}.tar.gz`);
  const oldCommit = git('rev-parse', 'HEAD');

  execFileSync('tar', [
    '-czf', backup,
    '-C', ROOT,
    '--exclude=./.git',
    '--exclude=./node_modules',
    '--exclude=./dist',
    '.'
  ], { stdio: 'inherit' });

  console.log(`بکاپ ذخیره شد: ${backup}`);

  const changed = git('diff', '--name-only', 'HEAD', 'origin/main')
    .split('\n');

  const dependenciesChanged = changed.some(file =>
    ['package.json', 'package-lock.json'].includes(file)
  );

  try {
    console.log('\n۴. دریافت نسخه جدید...');
    run('git', ['pull', '--ff-only', 'origin', BRANCH]);

    if (dependenciesChanged) {
      console.log('\n۵. نصب وابستگی‌ها...');
      run('npm', ['ci']);
    }

    console.log('\n۶. بررسی Build...');
    run('npm', ['run', 'build']);

    console.log('\nبه‌روزرسانی با موفقیت انجام شد.');
    console.log(`نسخه فعلی: ${git('rev-parse', '--short', 'HEAD')}`);
    console.log(`بکاپ قبلی: ${backup}`);

  } catch (error) {
    console.error('\nخطا در به‌روزرسانی؛ بازگردانی نسخه قبلی...');

    run('git', ['reset', '--hard', oldCommit]);

    if (dependenciesChanged) {
      run('npm', ['ci'], { allowFailure: true });
    }

    run('npm', ['run', 'build'], { allowFailure: true });

    console.log('کد به نسخه قبلی بازگشت.');
    console.log(`بکاپ نیز محفوظ است: ${backup}`);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'status') {
    run('git', ['status', '-sb']);
  } else if (command === 'update') {
    await update();
  } else {
    console.log(`
Modular App Builder Agent

دستورات:
  node tools/agent.js status
  node tools/agent.js update
`);
  }
}

main().catch(error => {
  console.error('\nخطا:', error.message);
  process.exitCode = 1;
});
