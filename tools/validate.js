#!/usr/bin/env node
/**
 * FENDIX REPO-VALIDATOR
 * Draait automatisch bij elke push via GitHub Actions (.github/workflows/validate.yml)
 * en lokaal via: node tools/validate.js
 *
 * Controleert:
 *  1. Alle losse .css-bestanden      → accolade-balans + csstree-parse
 *  2. Alle losse .js-bestanden       → node --check (syntax)
 *  3. webflow/head.html + footer.html → <style>-blokken (balans + parse)
 *                                       en inline <script>-blokken (syntax)
 *  4. Footer: alle opmerkend/fendix-URL's zelfde tag in formaat vX.Y.Z
 *     (vangt de "v.1.7.1"-klasse typefouten en gemixte versies)
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let fouten = 0;
let waarschuwingen = 0;

function fail(msg) { console.error('  ✗ FOUT: ' + msg); fouten++; }
function warn(msg) { console.warn('  ⚠ waarschuwing: ' + msg); waarschuwingen++; }
function ok(msg) { console.log('  ✓ ' + msg); }
function kop(msg) { console.log('\n' + msg); }

// ---------- hulpfuncties ----------

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function accoladeBalans(css, label) {
  const schoon = stripCssComments(css);
  const open = (schoon.match(/{/g) || []).length;
  const dicht = (schoon.match(/}/g) || []).length;
  if (open !== dicht) {
    fail(label + ': accolade-balans klopt niet (' + open + ' openend, ' + dicht + ' sluitend, verschil ' + (open - dicht > 0 ? '+' : '') + (open - dicht) + ')');
    return false;
  }
  ok(label + ': accolades in balans (' + open + '/' + dicht + ')');
  return true;
}

let csstreeBeschikbaar = null;
function csstreeCheck(cssBestand, label) {
  if (csstreeBeschikbaar === null) {
    const test = spawnSync('csstree-validator', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
    csstreeBeschikbaar = !test.error;
    if (!csstreeBeschikbaar) warn('csstree-validator niet gevonden — parse-check overgeslagen (accolade-balans is wel gedaan)');
  }
  if (!csstreeBeschikbaar) return;
  const res = spawnSync('csstree-validator', [cssBestand], { encoding: 'utf8', shell: process.platform === 'win32' });
  const uitvoer = ((res.stdout || '') + (res.stderr || '')).trim();
  if (res.status !== 0 && uitvoer) {
    fail(label + ': csstree vindt parse-problemen:\n    ' + uitvoer.split('\n').slice(0, 12).join('\n    '));
  } else {
    ok(label + ': csstree-parse schoon');
  }
}

function nodeSyntaxCheck(jsBestand, label) {
  const res = spawnSync(process.execPath, ['--check', jsBestand], { encoding: 'utf8' });
  if (res.status !== 0) {
    fail(label + ': JavaScript-syntaxfout:\n    ' + (res.stderr || '').trim().split('\n').slice(0, 6).join('\n    '));
  } else {
    ok(label + ': JavaScript-syntax geldig');
  }
}

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fendix-validate-'));
function tmpBestand(naam, inhoud) {
  const p = path.join(TMP, naam);
  fs.writeFileSync(p, inhoud);
  return p;
}

// ---------- 1 & 2: losse bestanden in de repo-root ----------

kop('== Losse CSS-bestanden ==');
const cssBestanden = fs.readdirSync(ROOT).filter(f => f.endsWith('.css'));
if (!cssBestanden.length) warn('geen .css-bestanden gevonden in repo-root');
for (const f of cssBestanden) {
  const inhoud = fs.readFileSync(path.join(ROOT, f), 'utf8');
  accoladeBalans(inhoud, f);
  csstreeCheck(path.join(ROOT, f), f);
}

kop('== Losse JS-bestanden ==');
const jsBestanden = fs.readdirSync(ROOT).filter(f => f.endsWith('.js'));
if (!jsBestanden.length) warn('geen .js-bestanden gevonden in repo-root');
for (const f of jsBestanden) {
  nodeSyntaxCheck(path.join(ROOT, f), f);
}

// ---------- 3: Webflow head/footer bronbestanden ----------

function valideerWebflowHtml(bestand) {
  const vol = path.join(ROOT, 'webflow', bestand);
  kop('== webflow/' + bestand + ' ==');
  if (!fs.existsSync(vol)) {
    fail('webflow/' + bestand + ' ontbreekt — deze hoort als bronbestand in de repo');
    return;
  }
  const html = fs.readFileSync(vol, 'utf8');

  // <style>-blokken
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m, si = 0;
  while ((m = styleRe.exec(html)) !== null) {
    si++;
    const label = bestand + ' <style> blok ' + si;
    if (accoladeBalans(m[1], label)) {
      csstreeCheck(tmpBestand(bestand + '-style-' + si + '.css', m[1]), label);
    }
  }
  if (si === 0) ok(bestand + ': geen <style>-blokken (niets te valideren)');

  // inline <script>-blokken (zonder src)
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let sj = 0, geskipt = 0;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;                 // extern script: geen inhoud
    if (/\btype\s*=\s*["'](?!text\/javascript|module)/i.test(attrs)) { geskipt++; continue; } // json/ld+json e.d.
    if (!m[2].trim()) continue;
    sj++;
    nodeSyntaxCheck(tmpBestand(bestand + '-script-' + sj + '.js', m[2]), bestand + ' inline <script> ' + sj);
  }
  if (sj === 0) ok(bestand + ': geen inline scripts (niets te valideren)');
}

valideerWebflowHtml('head.html');
valideerWebflowHtml('footer.html');

// ---------- 4: versie-consistentie in de footer ----------

kop('== Versie-consistentie (footer) ==');
const footerPad = path.join(ROOT, 'webflow', 'footer.html');
if (fs.existsSync(footerPad)) {
  const footer = fs.readFileSync(footerPad, 'utf8');
  const versies = [];
  const verRe = /opmerkend\/fendix@([^/"'\s]+)\//g;
  let vm;
  while ((vm = verRe.exec(footer)) !== null) versies.push(vm[1]);
  if (!versies.length) {
    warn('geen opmerkend/fendix-URL’s gevonden in footer.html');
  } else {
    const uniek = [...new Set(versies)];
    const formaatFout = uniek.filter(v => !/^v\d+\.\d+\.\d+$/.test(v));
    if (formaatFout.length) {
      fail('tag-formaat ongeldig: "' + formaatFout.join('", "') + '" — verwacht vX.Y.Z (zonder punt na de v!)');
    }
    if (uniek.length > 1) {
      fail('gemixte versies in footer: ' + uniek.join(', ') + ' — alle fendix-bestanden horen op dezelfde tag');
    }
    if (!formaatFout.length && uniek.length === 1) {
      ok('alle ' + versies.length + ' fendix-URL’s op dezelfde geldige tag: ' + uniek[0]);
    }
  }
  // tracking hoort op @main te blijven (afspraak met Nick)
  if (footer.includes('measurebase/next-gen-fendix-nick') && !footer.includes('measurebase/next-gen-fendix-nick@main/')) {
    warn('measurebase-tracking staat niet (meer) op @main — afspraak was: ongewijzigd laten');
  }
}

// ---------- eindstand ----------

console.log('\n' + '='.repeat(50));
if (fouten) {
  console.error('RESULTAAT: ' + fouten + ' fout(en), ' + waarschuwingen + ' waarschuwing(en) — NIET plakken/taggen!');
  process.exit(1);
} else {
  console.log('RESULTAAT: alles schoon (' + waarschuwingen + ' waarschuwing(en)) — veilig om te plakken/taggen ✓');
}
</parameter>
