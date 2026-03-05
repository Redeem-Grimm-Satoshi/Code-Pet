import * as vscode from 'vscode';

type PetMood = 'happy' | 'angry';

class PetSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codeCompanionPet.view';

  private view?: vscode.WebviewView;
  private mood: PetMood = 'happy';
  private xp = 0;
  private streak = 0;
  private hasSyntaxError = false;
  private lastBarkAt = 0;

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    this.pushState('Zolix is here 🐾');
  }

  react(mood: PetMood, reason: string) {
    if (mood === 'happy') {
      this.streak += 1;
      this.xp += 12;
    } else {
      this.streak = 0;
      this.xp = Math.max(0, this.xp - 5);
    }

    this.mood = mood;
    this.pushState(reason);
  }

  setSyntaxErrorState(hasError: boolean, reason: string) {
    this.hasSyntaxError = hasError;
    this.react(hasError ? 'angry' : 'happy', reason);

    if (hasError) {
      const now = Date.now();
      if (now - this.lastBarkAt > 1400) {
        this.lastBarkAt = now;
        this.view?.webview.postMessage({ type: 'pet:bark' });
      }
    }
  }

  updateGaze(normX: number, normY: number) {
    this.view?.webview.postMessage({ type: 'pet:gaze', x: normX, y: normY });
  }

  private pushState(reason: string) {
    if (!this.view) return;

    const cfg = vscode.workspace.getConfiguration('codeCompanionPet');
    const level = Math.floor(this.xp / 120) + 1;
    const evolution = level >= 10 ? 'LEGEND MODE' : level >= 6 ? 'SENIOR BUDDY' : level >= 3 ? 'TEAMMATE' : 'NEW PAL';

    this.view.webview.postMessage({
      type: 'pet:update',
      mood: this.mood,
      xp: this.xp,
      streak: this.streak,
      level,
      evolution,
      reason,
      petName: cfg.get<string>('petName', 'Zolix'),
      puppySounds: cfg.get<boolean>('petPuppySounds', true)
    });
  }

  private getHtml(): string {
    const nonce = Date.now().toString();
    return `<!doctype html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    body {
      margin: 0;
      padding: 12px;
      font-family: Inter, Segoe UI, sans-serif;
      background: radial-gradient(circle at top, #1d3128 0%, #0b130e 72%);
      color: #eefff3;
    }

    .card {
      border-radius: 16px;
      padding: 12px;
      border: 1px solid #5ea777;
      background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.23));
      box-shadow: 0 12px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .name { font-size: 16px; font-weight: 700; letter-spacing: 0.3px; }
    .mood { font-size: 12px; opacity: 0.92; }

    .scene {
      position: relative;
      border-radius: 14px;
      height: 250px;
      overflow: hidden;
      background:
        radial-gradient(170px 100px at 50% 14%, rgba(255,255,255,0.23), transparent 70%),
        linear-gradient(180deg, #334a40 0%, #17241d 72%);
    }

    .puppyWrap {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -42%);
      transform-origin: center center;
      filter: drop-shadow(0 12px 14px rgba(0,0,0,0.33));
    }

    .puppyWrap.happy { animation: floaty 1.2s ease-in-out infinite; }
    .puppyWrap.angry { animation: shake 210ms linear infinite; }

    svg { width: 210px; height: 210px; }

    .meter { margin-top: 10px; background: #0f1712; border: 1px solid #425c4a; border-radius: 8px; overflow: hidden; }
    .bar { height: 10px; width: 0%; background: linear-gradient(90deg,#86fcb7,#d6ff8f); transition: width 160ms ease; }
    .meta { margin-top: 8px; font-size: 12px; opacity: 0.95; }
    .reason { margin-top: 8px; font-size: 12px; color: #d2f5df; min-height: 28px; }

    @keyframes floaty { 0%,100% { transform: translate(-50%, -42%); } 50% { transform: translate(-50%, -45%); } }
    @keyframes shake { 0%,100% { transform: translate(-50%, -42%) rotate(0deg); } 25% { transform: translate(-50%, -42%) rotate(-1deg);} 75% { transform: translate(-50%, -42%) rotate(1deg);} }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="name" id="name">Zolix</div>
      <div class="mood" id="mood">Happy helper mode</div>
    </div>

    <div class="scene">
      <div class="puppyWrap happy" id="puppyWrap">
        <svg viewBox="0 0 220 220" aria-label="Cute puppy mascot">
          <defs>
            <radialGradient id="furBrown" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#f0c69f"/>
              <stop offset="62%" stop-color="#b97848"/>
              <stop offset="100%" stop-color="#8a562f"/>
            </radialGradient>
            <radialGradient id="furDark" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stop-color="#a36943"/>
              <stop offset="100%" stop-color="#6f4327"/>
            </radialGradient>
            <radialGradient id="eyeGreen" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#d7ffd8"/>
              <stop offset="55%" stop-color="#5fd06f"/>
              <stop offset="100%" stop-color="#2b7f3a"/>
            </radialGradient>
          </defs>

          <ellipse cx="110" cy="170" rx="46" ry="12" fill="rgba(0,0,0,0.22)"/>

          <g id="headGroup">
            <ellipse cx="64" cy="68" rx="25" ry="34" fill="url(#furDark)" stroke="#4e301e" stroke-width="3" transform="rotate(-22 64 68)"/>
            <ellipse cx="156" cy="68" rx="25" ry="34" fill="url(#furDark)" stroke="#4e301e" stroke-width="3" transform="rotate(22 156 68)"/>

            <ellipse cx="110" cy="96" rx="74" ry="62" fill="url(#furBrown)" stroke="#563621" stroke-width="3"/>
            <ellipse cx="110" cy="95" rx="21" ry="53" fill="#f6f3ee"/>

            <g>
              <ellipse id="eyeL" cx="80" cy="90" rx="20" ry="20" fill="url(#eyeGreen)" stroke="#243427" stroke-width="2.5"/>
              <ellipse id="eyeR" cx="140" cy="90" rx="20" ry="20" fill="url(#eyeGreen)" stroke="#243427" stroke-width="2.5"/>
              <g id="pupilL" transform="translate(0 0)">
                <circle cx="80" cy="90" r="7.5" fill="#0b1a0e"/>
                <circle cx="76" cy="86" r="3" fill="#ffffff" opacity="0.92"/>
              </g>
              <g id="pupilR" transform="translate(0 0)">
                <circle cx="140" cy="90" r="7.5" fill="#0b1a0e"/>
                <circle cx="136" cy="86" r="3" fill="#ffffff" opacity="0.92"/>
              </g>
            </g>

            <ellipse cx="110" cy="120" rx="10" ry="7" fill="#141414"/>
            <path id="smile" d="M96 130 Q110 142 124 130" fill="none" stroke="#5f3a24" stroke-width="3" stroke-linecap="round"/>
            <path id="tongue" d="M104 133 Q110 144 116 133 L116 140 Q110 148 104 140 Z" fill="#ff80a2" opacity="0.95"/>
          </g>

        </svg>
      </div>
    </div>

    <div class="meter"><div class="bar" id="bar"></div></div>
    <div class="meta" id="meta">Level 1 • NEW PAL • Streak 0</div>
    <div class="reason" id="reason">Zolix is here 🐾</div>
  </div>

  <script nonce="${nonce}">
    const puppyWrap = document.getElementById('puppyWrap');
    const moodEl = document.getElementById('mood');
    const nameEl = document.getElementById('name');
    const bar = document.getElementById('bar');
    const meta = document.getElementById('meta');
    const reason = document.getElementById('reason');

    const headGroup = document.getElementById('headGroup');
    const pupilL = document.getElementById('pupilL');
    const pupilR = document.getElementById('pupilR');
    const eyeL = document.getElementById('eyeL');
    const eyeR = document.getElementById('eyeR');
    const smile = document.getElementById('smile');

    let mood = 'happy';
    let soundsOn = true;
    let audioCtx;

    function setMood(nextMood) {
      const prev = mood;
      mood = nextMood === 'angry' ? 'angry' : 'happy';
      puppyWrap.classList.remove('happy', 'angry');
      void puppyWrap.offsetWidth;
      puppyWrap.classList.add(mood);

      moodEl.textContent = mood === 'happy' ? 'Happy helper mode' : 'Syntax alert mode';
      smile.setAttribute('d', mood === 'happy' ? 'M96 130 Q110 142 124 130' : 'M96 139 Q110 130 124 139');
      eyeL.setAttribute('fill', mood === 'happy' ? 'url(#eyeGreen)' : '#ff4d4d');
      eyeR.setAttribute('fill', mood === 'happy' ? 'url(#eyeGreen)' : '#ff4d4d');
      eyeL.setAttribute('stroke', mood === 'happy' ? '#243427' : '#7a0b0b');
      eyeR.setAttribute('stroke', mood === 'happy' ? '#243427' : '#7a0b0b');

      if (mood === 'angry' && prev !== 'angry') playBark();
    }

    function setGaze(x, y) {
      const dx = Math.max(-4, Math.min(4, x * 4));
      const dy = Math.max(-3, Math.min(3, y * 3));
      pupilL.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');
      pupilR.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');

      const hx = Math.max(-6, Math.min(6, x * 6));
      const hy = Math.max(-4, Math.min(4, y * 4));
      headGroup.setAttribute('transform', 'translate(' + hx + ' ' + hy + ')');
    }

    function ensureAudio() {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      if (!audioCtx) audioCtx = new A();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playBark() {
      if (!soundsOn) return;
      const ctx = ensureAudio();
      if (!ctx) return;

      const g = ctx.createGain();
      g.gain.value = 0.06;
      g.connect(ctx.destination);

      const o1 = ctx.createOscillator();
      o1.type = 'square';
      o1.frequency.setValueAtTime(460, ctx.currentTime);
      o1.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.1);
      o1.connect(g);

      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(720, ctx.currentTime + 0.06);
      o2.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.18);
      o2.connect(g);

      o1.start(); o1.stop(ctx.currentTime + 0.12);
      o2.start(ctx.currentTime + 0.06); o2.stop(ctx.currentTime + 0.2);
    }

    window.addEventListener('pointerdown', () => ensureAudio(), { passive: true });
    window.addEventListener('keydown', () => ensureAudio());

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'pet:update') {
        nameEl.textContent = msg.petName || 'Zolix';
        soundsOn = !!msg.puppySounds;
        setMood(msg.mood);

        const pct = Math.max(0, Math.min(100, ((msg.xp % 120) / 120) * 100));
        bar.style.width = pct + '%';
        meta.textContent = 'Level ' + msg.level + ' • ' + msg.evolution + ' • Streak ' + msg.streak;
        reason.textContent = msg.reason;
      }

      if (msg.type === 'pet:gaze') setGaze(msg.x, msg.y);
      if (msg.type === 'pet:bark') playBark();
    });
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const petProvider = new PetSidebarProvider();
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(PetSidebarProvider.viewType, petProvider));

  const hasErrorDiagnostics = (uri: vscode.Uri) =>
    vscode.languages.getDiagnostics(uri).some((d) => d.severity === vscode.DiagnosticSeverity.Error);

  const pushEditorGaze = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const pos = editor.selection.active;
    const range = editor.visibleRanges[0];
    if (!range) return;

    const totalLines = Math.max(1, range.end.line - range.start.line + 1);
    const yNorm = ((pos.line - range.start.line) / totalLines) * 2 - 1;

    const lineText = editor.document.lineAt(pos.line).text;
    const xNorm = lineText.length > 0 ? (pos.character / Math.max(1, lineText.length)) * 2 - 1 : -1;

    petProvider.updateGaze(
      Math.max(-1, Math.min(1, xNorm)),
      Math.max(-1, Math.min(1, yNorm))
    );
  };

  const diagnosticsSub = vscode.languages.onDidChangeDiagnostics((event) => {
    const hasError = event.uris.some((uri) => hasErrorDiagnostics(uri));
    petProvider.setSyntaxErrorState(hasError, hasError ? 'Syntax issue detected' : 'Syntax clean ✅');
  });

  const saveSub = vscode.workspace.onDidSaveTextDocument((doc) => {
    const hasError = hasErrorDiagnostics(doc.uri);
    petProvider.setSyntaxErrorState(hasError, hasError ? 'Saved with syntax error' : 'Saved clean syntax ✅');
  });

  const selectionSub = vscode.window.onDidChangeTextEditorSelection(() => pushEditorGaze());
  const activeEditorSub = vscode.window.onDidChangeActiveTextEditor(() => pushEditorGaze());
  const rangeSub = vscode.window.onDidChangeTextEditorVisibleRanges(() => pushEditorGaze());

  const testHappyCmd = vscode.commands.registerCommand('codeCompanionPet.testHappy', () => {
    petProvider.react('happy', 'Manual happy test');
  });

  const testAngryCmd = vscode.commands.registerCommand('codeCompanionPet.testAngry', () => {
    petProvider.setSyntaxErrorState(true, 'Manual syntax alert test');
  });

  context.subscriptions.push(
    diagnosticsSub,
    saveSub,
    selectionSub,
    activeEditorSub,
    rangeSub,
    testHappyCmd,
    testAngryCmd
  );

  pushEditorGaze();
}

export function deactivate() {}
