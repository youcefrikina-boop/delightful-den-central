import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Lock, Eye, EyeOff, Check, X, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "إعادة تعيين كلمة المرور — DafaTek CRM" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash on landing.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const rules = useMemo(() => ({
    len: password.length >= 8,
    letter: /[A-Za-z\u0600-\u06FF]/.test(password),
    digit: /\d/.test(password),
  }), [password]);
  const pwdOk = rules.len && rules.letter && rules.digit;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pwdOk) { toast.error("كلمة المرور لا تستوفي الشروط"); return; }
    if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("تم تحديث كلمة المرور");
      navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر التحديث");
    } finally { setBusy(false); }
  }

  return (
    <div dir="rtl" className="min-h-screen text-slate-100 grid place-items-center px-4" style={{ backgroundColor: "#060d1f" }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1a2e] p-6 shadow-2xl">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/30">
            <KeyRound className="size-7 text-slate-950" />
          </div>
          <h1 className="text-lg font-bold">إعادة تعيين كلمة المرور</h1>
          <p className="text-xs text-slate-400">اختر كلمة مرور جديدة لحسابك.</p>
        </div>

        {!ready ? (
          <p className="text-center text-xs text-slate-400">جاري التحقق من رابط الاستعادة...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">كلمة المرور الجديدة</span>
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d1f] px-3">
                <Lock className="size-4 text-slate-500" />
                <input type={showPwd ? "text" : "password"} required minLength={8}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-slate-500 hover:text-slate-200">
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">تأكيد كلمة المرور</span>
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d1f] px-3">
                <Lock className="size-4 text-slate-500" />
                <input type={showConfirm ? "text" : "password"} required minLength={8}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-slate-500 hover:text-slate-200">
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <span className="mt-1 block text-[11px] text-rose-400">كلمتا المرور غير متطابقتين</span>
              )}
            </label>

            <ul className="space-y-1 rounded-md border border-slate-800 bg-[#060d1f]/60 p-2 text-[11px]">
              <Rule ok={rules.len} text="8 أحرف على الأقل" />
              <Rule ok={rules.letter} text="تحتوي على حرف" />
              <Rule ok={rules.digit} text="تحتوي على رقم" />
            </ul>

            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              تحديث كلمة المرور
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-300" : "text-slate-500"}`}>
      {ok ? <Check className="size-3" /> : <X className="size-3" />}{text}
    </li>
  );
}
