import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellRing,
  Clock,
  Download,
  Moon,
  Plus,
  Settings,
  Smartphone,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKEND = ["Sat", "Sun"];

interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  ampm: "AM" | "PM";
  enabled: boolean;
  repeat: string[];
}

interface MathQuestion {
  display: string;
  answer: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function alarmToMinutes(alarm: Alarm): number {
  let h = alarm.hour % 12;
  if (alarm.ampm === "PM") h += 12;
  return h * 60 + alarm.minute;
}

function getGreeting(hour24: number): string {
  if (hour24 < 12) return "Good Morning";
  if (hour24 < 17) return "Good Afternoon";
  if (hour24 < 21) return "Good Evening";
  return "Good Night";
}

function getDateString(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function repeatLabel(repeat: string[]): string {
  if (repeat.length === 0) return "One-time";
  if (repeat.length === 7) return "Every day";
  const sorted = [...repeat].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  const sortedWeekdays = [...WEEKDAYS].sort(
    (a, b) => DAYS.indexOf(a) - DAYS.indexOf(b),
  );
  const sortedWeekend = [...WEEKEND].sort(
    (a, b) => DAYS.indexOf(a) - DAYS.indexOf(b),
  );
  if (JSON.stringify(sorted) === JSON.stringify(sortedWeekdays))
    return "Mon \u2013 Fri";
  if (JSON.stringify(sorted) === JSON.stringify(sortedWeekend))
    return "Sat \u2013 Sun";
  return sorted.join(" ");
}

const STORAGE_KEY = "dusk-alarm-alarms";

function loadAlarms(): Alarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Alarm[];
  } catch {
    return [];
  }
}

function saveAlarms(alarms: Alarm[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

const ALARM_SOUND_URL =
  "/assets/suzume_no_tojimari-019d3a51-e561-76bf-b4f7-75213cff7cae.mp3";

function getInstallPlatform(): "ios" | "android" | "desktop" | "other" {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (/Chrome|Edg/.test(ua)) return "desktop";
  return "other";
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(): MathQuestion {
  const a = rand(1, 20);
  const b = rand(1, 20);
  const op = Math.random() > 0.5 ? "+" : "-";
  if (op === "-" && b > a) return { display: `${b} - ${a} = ?`, answer: b - a };
  return {
    display: `${a} ${op} ${b} = ?`,
    answer: op === "+" ? a + b : a - b,
  };
}

// ─── Settings Screen ─────────────────────────────────────────────────────────
function SettingsScreen({
  userName,
  onSave,
}: { userName: string; onSave: (name: string) => void }) {
  const [nameInput, setNameInput] = useState(userName);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(nameInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <div
        className="rounded-2xl p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.016 255) 0%, oklch(0.19 0.014 252) 100%)",
          boxShadow:
            "0 8px 32px oklch(0 0 0 / 0.4), 0 1px 0 oklch(1 0 0 / 0.06) inset",
        }}
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.55 0.15 280 / 0.2)" }}
          >
            <User
              className="w-5 h-5"
              style={{ color: "oklch(0.74 0.10 185)" }}
            />
          </div>
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "oklch(0.96 0.012 270)" }}
            >
              Profile Settings
            </h2>
            <p className="text-xs" style={{ color: "oklch(0.60 0.015 255)" }}>
              Personalize your wake-up experience
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="user-name-input"
              className="text-xs font-semibold tracking-wide uppercase block mb-2"
              style={{ color: "oklch(0.68 0.015 255)" }}
            >
              Your Name
            </Label>
            <Input
              id="user-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Alex"
              className="bg-white/5 border-white/10 text-base"
              style={{ color: "oklch(0.96 0.012 270)" }}
              data-ocid="settings.input"
            />
            <p
              className="text-xs mt-2 leading-relaxed"
              style={{ color: "oklch(0.52 0.015 255)" }}
            >
              Your name is used in the wake-up message when your alarm rings.
            </p>
          </div>

          {/* Preview */}
          {nameInput.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.55 0.15 280 / 0.1)",
                border: "1px solid oklch(0.55 0.15 280 / 0.25)",
              }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "oklch(0.68 0.015 255)" }}
              >
                Message Preview
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(0.88 0.012 270)" }}
              >
                \u201c{nameInput.trim()}, you said you want to crack exams. Wake
                up.\u201d
              </p>
            </motion.div>
          )}

          <Button
            onClick={handleSave}
            className="w-full font-semibold tracking-wide transition-all"
            style={{
              background: saved
                ? "oklch(0.55 0.13 165)"
                : "oklch(0.55 0.15 280)",
              color: "oklch(0.98 0.005 270)",
              boxShadow: "0 4px 16px oklch(0.55 0.15 280 / 0.35)",
            }}
            data-ocid="settings.save_button"
          >
            {saved ? "\u2713 Saved!" : "Save Settings"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Alarm Firing Overlay ─────────────────────────────────────────────────────
function AlarmFiringOverlay({
  firingAlarm,
  userName,
  onDismiss,
  onSnooze,
}: {
  firingAlarm: Alarm;
  userName: string;
  onDismiss: () => void;
  onSnooze: () => void;
}) {
  // Math challenge state
  const [mathProgress, setMathProgress] = useState(0);
  const [question, setQuestion] = useState<MathQuestion>(() =>
    generateQuestion(),
  );
  const [mathInput, setMathInput] = useState("");
  const [mathError, setMathError] = useState(false);
  const [mathWrong, setMathWrong] = useState(false);
  const mathInputRef = useRef<HTMLInputElement>(null);

  // Tap challenge state
  const [tapCount, setTapCount] = useState(0);
  const TAP_GOAL = 20;

  useEffect(() => {
    if (mathInputRef.current) {
      mathInputRef.current.focus();
    }
  }, []);

  const handleMathSubmit = () => {
    const val = Number.parseInt(mathInput, 10);
    if (Number.isNaN(val)) {
      setMathError(true);
      setTimeout(() => setMathError(false), 500);
      return;
    }
    if (val === question.answer) {
      const next = mathProgress + 1;
      if (next >= 3) {
        onDismiss();
      } else {
        setMathProgress(next);
        setQuestion(generateQuestion());
        setMathInput("");
        setMathWrong(false);
      }
    } else {
      setMathError(true);
      setMathWrong(true);
      setMathInput("");
      setTimeout(() => setMathError(false), 500);
    }
  };

  const handleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= TAP_GOAL) {
      onDismiss();
    }
  };

  const handleSnooze = () => {
    setMathProgress(0);
    setQuestion(generateQuestion());
    setMathInput("");
    setMathWrong(false);
    setTapCount(0);
    onSnooze();
  };

  const motivationMsg = userName
    ? `${userName}, you said you want to crack exams. Wake up.`
    : "Wake up! Time to rise and grind.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background: "oklch(0.1 0.012 255 / 0.92)",
        backdropFilter: "blur(12px)",
      }}
      data-ocid="alarm-firing.modal"
    >
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="alarm-pulse rounded-2xl p-6 w-full max-w-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.018 260) 0%, oklch(0.18 0.016 250) 100%)",
            border: "1px solid oklch(0.55 0.15 280 / 0.4)",
          }}
        >
          {/* Bell + alarm info */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1.5,
                duration: 0.6,
              }}
              className="inline-flex mb-3"
            >
              <BellRing
                className="w-10 h-10"
                style={{ color: "oklch(0.74 0.10 185)" }}
              />
            </motion.div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: "oklch(0.68 0.015 255)" }}
            >
              Alarm Ringing
            </p>
            <h3
              className="text-xl font-bold mb-0.5"
              style={{ color: "oklch(0.96 0.012 270)" }}
            >
              {firingAlarm.label}
            </h3>
            <p
              className="text-base font-semibold"
              style={{ color: "oklch(0.74 0.10 185)" }}
            >
              {firingAlarm.hour}:{pad(firingAlarm.minute)} {firingAlarm.ampm}
            </p>
          </div>

          {/* Motivation banner */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "oklch(0.55 0.15 280 / 0.12)",
              border: "1px solid oklch(0.55 0.15 280 / 0.3)",
            }}
          >
            <p
              className="text-sm font-bold mb-1 leading-snug"
              style={{ color: "oklch(0.92 0.012 270)" }}
            >
              {motivationMsg}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.65 0.015 255)" }}>
              This alarm will NOT stop until you complete a real-world task.
            </p>
          </div>

          {/* Challenge cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Card A: Math */}
            <div
              className="rounded-xl p-5"
              style={{
                background: "oklch(0.20 0.018 260)",
                border: "1px solid oklch(0.74 0.10 185 / 0.25)",
              }}
              data-ocid="alarm-firing.panel"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">\u2795</span>
                <h4
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: "oklch(0.74 0.10 185)" }}
                >
                  Math Challenge
                </h4>
              </div>
              <p
                className="text-xs mb-3"
                style={{ color: "oklch(0.55 0.015 255)" }}
              >
                Solve 3 Math Questions
              </p>

              {/* Progress dots */}
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < mathProgress
                          ? "oklch(0.74 0.10 185)"
                          : i === mathProgress
                            ? "oklch(0.55 0.15 280)"
                            : "oklch(1 0 0 / 0.1)",
                    }}
                  />
                ))}
              </div>

              <p
                className="text-xs font-medium mb-2"
                style={{ color: "oklch(0.65 0.015 255)" }}
              >
                Question {mathProgress + 1} / 3
              </p>

              <p
                className="text-2xl font-bold mb-4 tabular-nums"
                style={{ color: "oklch(0.96 0.012 270)" }}
              >
                {question.display}
              </p>

              <motion.div
                animate={mathError ? { x: [-6, 6, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex gap-2"
              >
                <input
                  ref={mathInputRef}
                  type="number"
                  value={mathInput}
                  onChange={(e) => {
                    setMathInput(e.target.value);
                    setMathWrong(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleMathSubmit()}
                  className="flex-1 rounded-md border px-3 py-2 text-base font-bold bg-white/5 border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
                  placeholder="?"
                  data-ocid="alarm-firing.input"
                />
                <Button
                  onClick={handleMathSubmit}
                  className="font-semibold px-4"
                  style={{
                    background: "oklch(0.55 0.15 280)",
                    color: "oklch(0.98 0.005 270)",
                  }}
                  data-ocid="alarm-firing.submit_button"
                >
                  Submit
                </Button>
              </motion.div>

              <AnimatePresence>
                {mathWrong && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs mt-2"
                    style={{ color: "oklch(0.7 0.18 25)" }}
                    data-ocid="alarm-firing.error_state"
                  >
                    Wrong! Try again.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Card B: Tap */}
            <div
              className="rounded-xl p-5 flex flex-col"
              style={{
                background: "oklch(0.20 0.018 260)",
                border: "1px solid oklch(0.55 0.15 280 / 0.25)",
              }}
              data-ocid="alarm-firing.card"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👊</span>
                <h4
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: "oklch(0.74 0.10 185)" }}
                >
                  Tap Challenge
                </h4>
              </div>
              <p
                className="text-xs mb-3"
                style={{ color: "oklch(0.55 0.015 255)" }}
              >
                Tap 20 Times
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "oklch(0.65 0.015 255)" }}>
                    {tapCount} / {TAP_GOAL} taps
                  </span>
                  <span style={{ color: "oklch(0.74 0.10 185)" }}>
                    {Math.round((tapCount / TAP_GOAL) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(tapCount / TAP_GOAL) * 100}
                  className="h-2"
                  style={
                    {
                      "--progress-foreground": "oklch(0.74 0.10 185)",
                    } as React.CSSProperties
                  }
                />
              </div>

              <div className="flex-1 flex items-center justify-center">
                <motion.button
                  type="button"
                  onClick={handleTap}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full font-black text-2xl tracking-widest uppercase select-none cursor-pointer transition-shadow"
                  style={{
                    background:
                      tapCount >= TAP_GOAL
                        ? "oklch(0.55 0.13 165)"
                        : "linear-gradient(135deg, oklch(0.55 0.15 280) 0%, oklch(0.50 0.14 270) 100%)",
                    color: "oklch(0.98 0.005 270)",
                    boxShadow:
                      "0 8px 32px oklch(0.55 0.15 280 / 0.5), 0 2px 0 oklch(1 0 0 / 0.15) inset",
                    border: "2px solid oklch(0.65 0.14 285 / 0.5)",
                  }}
                  data-ocid="alarm-firing.primary_button"
                >
                  TAP!
                </motion.button>
              </div>

              {tapCount > 0 && tapCount < TAP_GOAL && (
                <p
                  className="text-xs text-center mt-3"
                  style={{ color: "oklch(0.65 0.015 255)" }}
                >
                  {TAP_GOAL - tapCount} more to go!
                </p>
              )}
            </div>
          </div>

          {/* Snooze */}
          <Button
            onClick={handleSnooze}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/10"
            style={{ color: "oklch(0.96 0.012 270)" }}
            data-ocid="alarm-firing.secondary_button"
          >
            Snooze 5 min
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadAlarms());
  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [view, setView] = useState<"alarms" | "settings">("alarms");
  const [userName, setUserName] = useState(
    () => localStorage.getItem("dusk-user-name") ?? "",
  );

  // PWA install prompt
  const installPromptRef = useRef<any>(null);
  const [installable, setInstallable] = useState(false);

  // Install banner
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const [showInstallBanner, setShowInstallBanner] = useState(
    () => !localStorage.getItem("dusk-install-dismissed") && !isStandalone,
  );

  const dismissBanner = () => {
    localStorage.setItem("dusk-install-dismissed", "1");
    setShowInstallBanner(false);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e;
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPromptRef.current) return;
    installPromptRef.current.prompt();
    await installPromptRef.current.userChoice;
    installPromptRef.current = null;
    setInstallable(false);
    dismissBanner();
  };

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem("dusk-user-name", name);
  };

  // Form state
  const [formTime, setFormTime] = useState("07:00");
  const [formLabel, setFormLabel] = useState("");
  const [formRepeat, setFormRepeat] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  // Persist alarms to localStorage whenever they change
  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const playAlarm = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ALARM_SOUND_URL);
      audioRef.current.loop = true;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Alarm check
  useEffect(() => {
    if (firingAlarm) return;
    const h = now.getHours();
    const m = now.getMinutes();
    const currentMinutes = h * 60 + m;
    const minuteKey = `${h}:${m}`;
    const todayAbbr = DAYS[now.getDay()];
    const dateStr = now.toDateString();

    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      const alarmMinutes = alarmToMinutes(alarm);
      if (alarmMinutes !== currentMinutes) continue;

      // Check repeat day constraint
      if (alarm.repeat.length > 0 && !alarm.repeat.includes(todayAbbr))
        continue;

      const key =
        alarm.repeat.length > 0
          ? `${alarm.id}-${dateStr}-${minuteKey}`
          : `${alarm.id}-${minuteKey}`;

      if (!firedRef.current.has(key)) {
        firedRef.current.add(key);
        setFiringAlarm(alarm);
        playAlarm();
        break;
      }
    }
  }, [now, alarms, firingAlarm, playAlarm]);

  const handleDismiss = useCallback(() => {
    stopAlarm();
    setFiringAlarm(null);
  }, [stopAlarm]);

  const handleSnooze = useCallback(() => {
    stopAlarm();
    const snoozeTime = new Date(now.getTime() + 5 * 60 * 1000);
    const sh = snoozeTime.getHours();
    const sm = snoozeTime.getMinutes();
    const ampm: "AM" | "PM" = sh >= 12 ? "PM" : "AM";
    const hour12 = sh % 12 === 0 ? 12 : sh % 12;
    const snoozeAlarm: Alarm = {
      id: `snooze-${Date.now()}`,
      label: `${firingAlarm?.label ?? "Alarm"} (Snooze)`,
      hour: hour12,
      minute: sm,
      ampm,
      enabled: true,
      repeat: [],
    };
    setAlarms((prev) => [...prev, snoozeAlarm]);
    setFiringAlarm(null);
  }, [stopAlarm, now, firingAlarm]);

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAlarm = () => {
    setFormError("");
    if (!formTime) {
      setFormError("Please select a time");
      return;
    }
    const [hourStr, minuteStr] = formTime.split(":");
    const hour24 = Number.parseInt(hourStr, 10);
    const minute = Number.parseInt(minuteStr, 10);
    if (Number.isNaN(hour24) || Number.isNaN(minute)) {
      setFormError("Invalid time");
      return;
    }
    const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const newAlarm: Alarm = {
      id: String(Date.now()),
      label: formLabel.trim() || "Alarm",
      hour: hour12,
      minute,
      ampm,
      enabled: true,
      repeat: formRepeat,
    };
    setAlarms((prev) => [...prev, newAlarm]);
    setFormTime("07:00");
    setFormLabel("");
    setFormRepeat([]);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const toggleFormDay = (day: string) => {
    setFormRepeat((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleQuickSelect = (days: string[]) => {
    const allSelected = days.every((d) => formRepeat.includes(d));
    setFormRepeat(allSelected ? [] : days);
  };

  const hours24 = now.getHours();
  const displayHour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const displayMinute = pad(now.getMinutes());
  const displaySecond = pad(now.getSeconds());
  const displayAmpm = hours24 >= 12 ? "PM" : "AM";
  const greeting = getGreeting(hours24);

  const platform = getInstallPlatform();

  return (
    <div className="min-h-screen flex flex-col" data-ocid="app.page">
      {/* Nav */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] backdrop-blur-md"
        style={{ background: "oklch(0.16 0.012 258 / 0.8)" }}
      >
        <div className="flex items-center gap-2.5">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.74 0.10 185)" }} />
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.96 0.012 270)" }}
          >
            Dusk Alarm
          </span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6" data-ocid="nav.link">
            <button
              type="button"
              onClick={() => setView("alarms")}
              className="text-xs font-medium transition-colors"
              style={{
                color:
                  view === "alarms"
                    ? "oklch(0.96 0.012 270)"
                    : "oklch(0.55 0.015 255)",
              }}
              data-ocid="nav.alarms.link"
            >
              Alarms
            </button>
            <button
              type="button"
              onClick={() => setView("settings")}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{
                color:
                  view === "settings"
                    ? "oklch(0.96 0.012 270)"
                    : "oklch(0.55 0.015 255)",
              }}
              data-ocid="nav.settings.link"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </nav>
          <AnimatePresence>
            {installable && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:bg-white/10"
                  style={{
                    border: "1px solid oklch(0.74 0.10 185 / 0.5)",
                    color: "oklch(0.74 0.10 185)",
                  }}
                  data-ocid="app.install_button"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="relative flex items-start gap-3 px-4 py-3 sm:px-6"
            style={{
              background: "oklch(0.20 0.018 260)",
              borderLeft: "3px solid oklch(0.74 0.10 185)",
              borderBottom: "1px solid oklch(1 0 0 / 0.06)",
            }}
            data-ocid="install.panel"
          >
            <Smartphone
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: "oklch(0.74 0.10 185)" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold mb-0.5"
                style={{ color: "oklch(0.88 0.012 270)" }}
              >
                Install Dusk Alarm as an app
              </p>
              {installable ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-md text-xs font-semibold transition-all hover:bg-white/10"
                  style={{
                    background: "oklch(0.55 0.15 280 / 0.25)",
                    border: "1px solid oklch(0.74 0.10 185 / 0.5)",
                    color: "oklch(0.74 0.10 185)",
                  }}
                  data-ocid="install.primary_button"
                >
                  <Download className="w-3 h-3" />
                  Install App
                </button>
              ) : (
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.65 0.015 255)" }}
                >
                  {platform === "ios" && (
                    <>
                      Tap the{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        Share button (\u25a1\u2191)
                      </span>{" "}
                      at the bottom, then{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        &ldquo;Add to Home Screen&rdquo;
                      </span>
                    </>
                  )}
                  {platform === "android" && (
                    <>
                      Tap the{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        menu (\u22ee)
                      </span>{" "}
                      or address bar install icon, then{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        &ldquo;Install app&rdquo;
                      </span>
                    </>
                  )}
                  {platform === "desktop" && (
                    <>
                      Click the{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        install icon
                      </span>{" "}
                      in the address bar, then{" "}
                      <span style={{ color: "oklch(0.74 0.10 185)" }}>
                        &ldquo;Install&rdquo;
                      </span>
                    </>
                  )}
                  {platform === "other" && (
                    <>
                      <span className="block">
                        <span style={{ color: "oklch(0.74 0.10 185)" }}>
                          iPhone/iPad:
                        </span>{" "}
                        Tap Share (\u25a1\u2191) \u2192 &ldquo;Add to Home
                        Screen&rdquo;
                      </span>
                      <span className="block">
                        <span style={{ color: "oklch(0.74 0.10 185)" }}>
                          Chrome/Edge:
                        </span>{" "}
                        Click the install icon in the address bar
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              className="flex-shrink-0 p-1 rounded transition-colors hover:bg-white/10"
              style={{ color: "oklch(0.55 0.015 255)" }}
              aria-label="Dismiss install banner"
              data-ocid="install.close_button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {view === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "oklch(0.96 0.012 270)" }}
                  >
                    Settings
                  </h1>
                </div>
                <SettingsScreen
                  userName={userName}
                  onSave={handleSaveUserName}
                />
              </motion.div>
            ) : (
              <motion.div
                key="alarms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Hero Clock Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative overflow-hidden rounded-2xl p-8 md:p-12"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.22 0.018 260) 0%, oklch(0.18 0.016 250) 100%)",
                    boxShadow:
                      "0 8px 40px oklch(0 0 0 / 0.55), 0 1px 0 oklch(1 0 0 / 0.06) inset",
                  }}
                  data-ocid="clock.card"
                >
                  <div
                    className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.55 0.15 280) 0%, transparent 70%)",
                      transform: "translate(30%, -30%)",
                    }}
                  />
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-4"
                    style={{ color: "oklch(0.68 0.015 255)" }}
                  >
                    Current Time
                  </p>
                  <div className="flex items-end gap-3 mb-3">
                    <span
                      className="text-glow font-bold leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(4rem, 12vw, 7.5rem)",
                        color: "oklch(0.96 0.012 270)",
                      }}
                    >
                      {displayHour}:{displayMinute}
                      <span
                        className="ml-1"
                        style={{
                          fontSize: "clamp(1.2rem, 3vw, 2rem)",
                          color: "oklch(0.68 0.015 255)",
                        }}
                      >
                        :{displaySecond}
                      </span>
                    </span>
                    <span
                      className="mb-3 font-semibold tracking-wide"
                      style={{
                        fontSize: "clamp(1.2rem, 3vw, 2rem)",
                        color: "oklch(0.74 0.10 185)",
                      }}
                    >
                      {displayAmpm}
                    </span>
                  </div>
                  <p
                    className="text-2xl font-semibold mb-1"
                    style={{ color: "oklch(0.88 0.012 270)" }}
                  >
                    {greeting} \u2736
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.68 0.015 255)" }}
                  >
                    {getDateString(now)}
                  </p>
                </motion.div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* My Alarms */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="lg:col-span-3"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2
                        className="text-xs font-bold tracking-widest uppercase"
                        style={{ color: "oklch(0.96 0.012 270)" }}
                      >
                        My Alarms
                      </h2>
                      <span
                        className="text-xs px-3 py-1 rounded-full border font-medium"
                        style={{
                          borderColor: "oklch(0.74 0.10 185 / 0.5)",
                          color: "oklch(0.74 0.10 185)",
                        }}
                      >
                        {alarms.filter((a) => a.enabled).length} active
                      </span>
                    </div>
                    <div className="space-y-3" data-ocid="alarms.list">
                      <AnimatePresence mode="popLayout">
                        {alarms.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-white/10"
                            data-ocid="alarms.empty_state"
                          >
                            <Clock
                              className="w-10 h-10 mb-3"
                              style={{ color: "oklch(0.45 0.015 255)" }}
                            />
                            <p
                              className="text-sm"
                              style={{ color: "oklch(0.55 0.015 255)" }}
                            >
                              No alarms set
                            </p>
                          </motion.div>
                        )}
                        {alarms.map((alarm, idx) => (
                          <AlarmCard
                            key={alarm.id}
                            alarm={alarm}
                            index={idx + 1}
                            onToggle={() => toggleAlarm(alarm.id)}
                            onDelete={() => deleteAlarm(alarm.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Set Alarm form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="lg:col-span-2"
                  >
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.22 0.016 255) 0%, oklch(0.19 0.014 252) 100%)",
                        boxShadow:
                          "0 8px 32px oklch(0 0 0 / 0.4), 0 1px 0 oklch(1 0 0 / 0.06) inset",
                      }}
                      data-ocid="set-alarm.card"
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <Bell
                          className="w-4 h-4"
                          style={{ color: "oklch(0.74 0.10 185)" }}
                        />
                        <h2
                          className="text-xs font-bold tracking-widest uppercase"
                          style={{ color: "oklch(0.96 0.012 270)" }}
                        >
                          Set Alarm
                        </h2>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label
                            className="text-xs font-medium mb-2 block"
                            style={{ color: "oklch(0.68 0.015 255)" }}
                          >
                            Time
                          </Label>
                          <input
                            type="time"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-lg font-bold bg-white/5 border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
                            data-ocid="set-alarm.input"
                          />
                        </div>
                        <div>
                          <Label
                            className="text-xs font-medium mb-2 block"
                            style={{ color: "oklch(0.68 0.015 255)" }}
                          >
                            Label
                          </Label>
                          <Input
                            value={formLabel}
                            onChange={(e) => setFormLabel(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddAlarm()
                            }
                            placeholder="e.g. Wake up"
                            className="bg-white/5 border-white/10"
                            data-ocid="set-alarm.textarea"
                          />
                        </div>

                        {/* Repeat section */}
                        <div>
                          <Label
                            className="text-xs font-medium mb-2 block"
                            style={{ color: "oklch(0.68 0.015 255)" }}
                          >
                            Repeat
                          </Label>
                          {/* Day chips */}
                          <div className="flex gap-1 mb-2 flex-wrap">
                            {DAYS.map((day) => {
                              const active = formRepeat.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleFormDay(day)}
                                  className="px-2 py-1 rounded-md text-xs font-semibold transition-all"
                                  style={{
                                    background: active
                                      ? "oklch(0.55 0.15 280)"
                                      : "oklch(1 0 0 / 0.06)",
                                    color: active
                                      ? "oklch(0.98 0.005 270)"
                                      : "oklch(0.65 0.015 255)",
                                    border: active
                                      ? "1px solid oklch(0.55 0.15 280 / 0.6)"
                                      : "1px solid oklch(1 0 0 / 0.1)",
                                  }}
                                  data-ocid={`set-alarm.toggle.${day.toLowerCase()}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                          {/* Quick-select presets */}
                          <div className="flex gap-1.5">
                            {[
                              { label: "Every day", days: DAYS },
                              { label: "Weekdays", days: WEEKDAYS },
                              { label: "Weekends", days: WEEKEND },
                            ].map(({ label, days }) => {
                              const allOn = days.every((d) =>
                                formRepeat.includes(d),
                              );
                              return (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => handleQuickSelect(days)}
                                  className="flex-1 text-xs py-1 px-1.5 rounded-md font-medium transition-all"
                                  style={{
                                    background: allOn
                                      ? "oklch(0.74 0.10 185 / 0.2)"
                                      : "oklch(1 0 0 / 0.04)",
                                    color: allOn
                                      ? "oklch(0.74 0.10 185)"
                                      : "oklch(0.60 0.015 255)",
                                    border: allOn
                                      ? "1px solid oklch(0.74 0.10 185 / 0.45)"
                                      : "1px solid oklch(1 0 0 / 0.08)",
                                  }}
                                  data-ocid={`set-alarm.toggle.${label.toLowerCase().replace(" ", "-")}`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {formError && (
                          <p
                            className="text-xs"
                            style={{ color: "oklch(0.7 0.18 25)" }}
                            data-ocid="set-alarm.error_state"
                          >
                            {formError}
                          </p>
                        )}
                        <Button
                          onClick={handleAddAlarm}
                          className="w-full font-semibold tracking-wide transition-all"
                          style={{
                            background: addedFeedback
                              ? "oklch(0.55 0.13 165)"
                              : "oklch(0.55 0.15 280)",
                            color: "oklch(0.98 0.005 270)",
                            boxShadow: "0 4px 16px oklch(0.55 0.15 280 / 0.35)",
                          }}
                          data-ocid="set-alarm.submit_button"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {addedFeedback ? "Added!" : "Add Alarm"}
                        </Button>
                        {addedFeedback && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-center"
                            style={{ color: "oklch(0.74 0.10 185)" }}
                            data-ocid="set-alarm.success_state"
                          >
                            \u2713 Alarm added successfully
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-white/[0.04]">
        <p className="text-xs" style={{ color: "oklch(0.45 0.012 255)" }}>
          \u00a9 {new Date().getFullYear()}. Built with \u2665 using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
            style={{ color: "oklch(0.55 0.10 280)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Alarm Firing Overlay */}
      <AnimatePresence>
        {firingAlarm && (
          <AlarmFiringOverlay
            firingAlarm={firingAlarm}
            userName={userName}
            onDismiss={handleDismiss}
            onSnooze={handleSnooze}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AlarmCard ───────────────────────────────────────────────────────────────
function AlarmCard({
  alarm,
  index,
  onToggle,
  onDelete,
}: {
  alarm: Alarm;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const timeStr = `${alarm.hour}:${pad(alarm.minute)} ${alarm.ampm}`;
  const isEnabled = alarm.enabled;
  const scheduleLabel = repeatLabel(alarm.repeat);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors"
      style={{
        background: isEnabled
          ? "linear-gradient(90deg, oklch(0.26 0.025 275) 0%, oklch(0.22 0.018 260) 100%)"
          : "oklch(0.20 0.012 255)",
        border: isEnabled
          ? "1px solid oklch(0.42 0.065 285 / 0.45)"
          : "1px solid oklch(1 0 0 / 0.06)",
        opacity: isEnabled ? 1 : 0.6,
      }}
      data-ocid={`alarms.item.${index}`}
    >
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{
            color: isEnabled
              ? "oklch(0.96 0.012 270)"
              : "oklch(0.68 0.015 255)",
          }}
        >
          {alarm.label}
        </p>
        <p
          className="text-2xl font-bold tabular-nums leading-tight"
          style={{
            color: isEnabled
              ? "oklch(0.96 0.012 270)"
              : "oklch(0.55 0.015 255)",
          }}
        >
          {timeStr}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.55 0.015 255)" }}
        >
          {scheduleLabel}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-dusk-teal"
          data-ocid={`alarms.toggle.${index}`}
        />
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg transition-colors hover:bg-red-500/15"
          style={{ color: "oklch(0.55 0.015 255)" }}
          data-ocid={`alarms.delete_button.${index}`}
          aria-label="Delete alarm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
