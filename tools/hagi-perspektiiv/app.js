.card { margin-top: 16px; }

.badge-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 10px; }
.badge {
  display:inline-flex; align-items:center; gap:6px;
  padding: 4px 10px; border-radius: 999px;
  border: 1px solid rgba(0,0,0,.12);
  font-size: 13px;
}
.badge.subtle { opacity: .75; }

.disclaimer { margin-top: 10px; }
.disclaimer summary { cursor:pointer; }

.progress-wrap { display:flex; gap:8px; flex-wrap:wrap; }
.step-chip {
  padding: 6px 10px; border-radius: 999px;
  border: 1px solid rgba(0,0,0,.12);
  font-size: 13px;
  user-select:none;
}
.step-chip.active { border-width: 2px; }
.step-chip.done { opacity: .85; }
.step-chip button { all: unset; cursor:pointer; }

.progress-meta { display:flex; justify-content:space-between; margin-top: 10px; gap: 12px; flex-wrap:wrap; }
.progressbar { height: 10px; border-radius: 999px; overflow:hidden; border: 1px solid rgba(0,0,0,.12); margin-top: 10px; }
.progressbar-fill { height: 100%; }

.stage-head { margin-bottom: 14px; }

.questions { display:flex; flex-direction:column; gap: 14px; }
.q {
  padding: 12px; border-radius: 12px;
  border: 1px solid rgba(0,0,0,.10);
}
.q h3 { margin: 0 0 6px 0; font-size: 16px; }
.q .hint { margin: 0 0 10px 0; opacity: .8; }
.q .opts { display:flex; gap: 10px; flex-wrap:wrap; }
.opt {
  display:flex; align-items:center; gap:8px;
  padding: 8px 10px; border-radius: 10px;
  border: 1px solid rgba(0,0,0,.12);
}
.opt input { transform: translateY(1px); }

.actions { display:flex; gap:10px; flex-wrap:wrap; margin-top: 14px; }
.secondary-actions { margin-top: 10px; }

.report-grid { display:grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }
@media (min-width: 900px) { .report-grid { grid-template-columns: 1fr 1fr; } }

.report-box {
  border: 1px solid rgba(0,0,0,.10);
  border-radius: 12px;
  padding: 12px;
}
.report-badges { display:flex; gap:8px; flex-wrap:wrap; margin-top: 8px; }

.h4 { margin: 0 0 8px 0; font-size: 15px; }
