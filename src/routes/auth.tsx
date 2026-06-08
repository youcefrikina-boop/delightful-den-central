import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Flame, Mail, Lock, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — DafaTek CRM" },
      { name: "description", content: "تسجيل الدخول إلى نظام إدارة ورشة صيانة المراجل DafaTek CRM." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const rules = useMemo(() => ({
    len: password.length >= 8,
    letter: /[A-Za-z\u0600-\u06FF]/.test(password),
    digit: /\d/.test(password),
  }), [password]);
  const pwdOk = rules.len && rules.letter && rules.digit;

  async function handleEmailAuth(e: FormEvent) {
    e.preventDefault();
    if (mode === "signup") {
      if (!pwdOk) { toast.error("كلمة المرور لا تستوفي الشروط"); return; }
      if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: displayName || email } },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب — تحقق من بريدك للتأكيد");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setBusy(false); }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("تم إرسال رابط الاستعادة إلى بريدك");
      setMode("signin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الإرسال");
    } finally { setBusy(false); }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) toast.error(result.error.message ?? "فشل تسجيل الدخول");
    } finally { setBusy(false); }
  }

  return (
    <div dir="rtl" className="min-h-screen text-slate-100 grid place-items-center px-4" style={{ backgroundColor: "#060d1f" }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1a2e] p-6 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/30">
            <Flame className="size-7 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold">DafaTek CRM</h1>
          <p className="text-xs text-slate-400">نظام إدارة ورشة صيانة المراجل والتدفئة المركزية</p>
        </div>

        {mode !== "forgot" && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-900/60 p-1 text-sm">
            <button onClick={() => setMode("signin")} className={`rounded-md py-2 transition ${mode === "signin" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`}>
              تسجيل الدخول
            </button>
            <button onClick={() => setMode("signup")} className={`rounded-md py-2 transition ${mode === "signup" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`}>
              إنشاء حساب
            </button>
          </div>
        )}

        {mode === "forgot" ? (
          <form onSubmit={handleForgot} className="space-y-3">
            <h2 className="text-sm font-semibold text-cyan-300">استعادة كلمة المرور</h2>
            <p className="text-xs text-slate-400">سنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
            <EmailField email={email} setEmail={setEmail} />
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              إرسال رابط الاستعادة
            </button>
            <button type="button" onClick={() => setMode("signin")} className="inline-flex w-full items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200">
              <ArrowLeft className="size-3.5" /> العودة لتسجيل الدخول
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">الاسم الكامل</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="اسم صاحب الورشة"
                  className="w-full rounded-md border border-slate-700 bg-[#060d1f] px-3 py-2 text-sm" />
              </label>
            )}
            <EmailField email={email} setEmail={setEmail} />

            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">كلمة المرور</span>
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d1f] px-3">
                <Lock className="size-4 text-slate-500" />
                <input type={showPwd ? "text" : "password"} required minLength={mode === "signup" ? 8 : 6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "إخفاء" : "إظهار"} className="text-slate-500 hover:text-slate-200">
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {mode === "signup" && (
              <>
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
              </>
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode("forgot")} className="text-[11px] text-cyan-300 hover:text-cyan-200">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              {mode === "signin" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {mode === "signin" ? "دخول" : "إنشاء الحساب"}
            </button>
          </form>
        )}

        <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" /> أو <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button onClick={handleGoogle} disabled={busy}
          className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-slate-700 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="size-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.47 1.18 4.95l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
          </svg>
          المتابعة باستخدام Google
        </button>
      </div>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">البريد الإلكتروني</span>
      <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d1f] px-3">
        <Mail className="size-4 text-slate-500" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent py-2 text-sm outline-none" placeholder="you@example.com" />
      </div>
    </label>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-300" : "text-slate-500"}`}>
      {ok ? <Check className="size-3" /> : <X className="size-3" />}{text}
    </li>
  );
}
