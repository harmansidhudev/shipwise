# Form UX Patterns

Production-ready form patterns for React + Tailwind + TypeScript apps covering layout decisions, validation timing, error handling, and interactive states. Every pattern includes a copy-paste component you can drop into your codebase.

## When to use

Reference this guide when building any user-facing form: signup flows, settings pages, checkout, onboarding wizards, or data entry screens. Use the decision frameworks to pick the right pattern instead of guessing.

---

## 1. Multi-step vs single-page decision framework

```
Should I split this form into steps?
│
├── Form has >7 fields?
│   ├── Yes → Multi-step
│   └── No ↓
│
├── Fields require different mental contexts?
│   │   (e.g., personal info + payment + shipping)
│   ├── Yes → Multi-step
│   └── No ↓
│
├── Form takes >3 minutes to complete?
│   ├── Yes → Multi-step
│   └── No ↓
│
└── None of the above → Single-page form
```

### Multi-step rules checklist

- [ ] Show a progress indicator (step 2 of 4) so users know how much is left
- [ ] Allow back navigation — never trap users in a step
- [ ] Save state between steps — if the user refreshes, they pick up where they left off
- [ ] Validate per step before allowing "Next" — do not wait until the final submit
- [ ] Keep step count to 2-5 — if you need more than 5, rethink your data model

### Copy-paste: multi-step form shell

```tsx
// [CUSTOMIZE] Replace step definitions with your own form sections
import { useState } from "react";

type Step = {
  id: string;
  label: string;
  component: React.ComponentType<{ onNext: () => void; onBack: () => void }>;
};

const STEPS: Step[] = [
  { id: "account", label: "Account", component: AccountStep },   // [CUSTOMIZE]
  { id: "profile", label: "Profile", component: ProfileStep },   // [CUSTOMIZE]
  { id: "preferences", label: "Preferences", component: PrefsStep }, // [CUSTOMIZE]
];

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const StepComponent = STEPS[currentStep].component;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress indicator */}
      <nav aria-label="Form progress" className="mb-8">
        <ol className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <li key={step.id} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < currentStep
                    ? "bg-green-600 text-white"
                    : i === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < currentStep ? "✓" : i + 1}
              </span>
              <span className="text-sm text-gray-700">{step.label}</span>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-px w-8 bg-gray-300" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <StepComponent onNext={goNext} onBack={goBack} />
    </div>
  );
}
```

### Multi-step state persistence

Persist step state so users don't lose progress on refresh. Use `sessionStorage` for sensitive forms, `localStorage` for drafts.

```tsx
// Add to MultiStepForm — persist current step + data across refresh
const STORAGE_KEY = "signup-form-state"; // [CUSTOMIZE]

function usePersistedStep(totalSteps: number) {
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(JSON.parse(saved).step, totalSteps - 1) : 0;
  });
  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step })); }, [step]);
  return [step, setStep] as const;
}
```

### Composing multi-step with button states

Wire the SubmitButton (section 4) into the multi-step shell. The "Next" button should enter loading state while async per-step validation runs (e.g., checking if an email is already taken).

```tsx
// Inside each step component:
const [status, setStatus] = useState<"idle" | "loading">("idle");
const handleNext = async () => {
  setStatus("loading");
  const valid = await validateStepAsync(formData); // [CUSTOMIZE] per-step validation
  setStatus("idle");
  if (valid) onNext();
};
// Use SubmitButton from section 4 with status prop
```

---

## 2. Validation timing decision tree

```
When should this field validate?
│
├── Is it email or password confirmation?
│   └── Yes → Validate on blur
│
├── Is it a username or unique field needing server check?
│   └── Yes → Validate on blur with async API call (show "Checking..." spinner)
│
├── Is it a password field (primary, not confirm)?
│   └── Yes → Validate on change (show strength meter in real-time)
│
├── Does the field power a live preview or search?
│   └── Yes → Validate on change with 300ms debounce
│
├── Is this a simple form with <5 fields?
│   └── Yes → Validate on submit only
│
└── Mixed form with some critical fields?
    └── Hybrid: validate critical fields on blur, rest on submit
```

| Timing | Best for | Why |
|--------|----------|-----|
| **On blur** | Email, username, password match | Catches errors after the user finishes typing, before submit |
| **On change + debounce** | Search bars, real-time previews | Gives instant feedback without firing on every keystroke |
| **On submit** | Short forms, simple data entry | Least disruptive — validates everything at once |
| **Hybrid** | Forms mixing critical + simple fields | Catches the important errors early, leaves simple fields alone |

### Copy-paste: Zod + React Hook Form with per-field timing

```tsx
// [CUSTOMIZE] Replace schema fields with your own form fields
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  displayName: z.string().min(2, "Display name needs at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

function ValidatedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger, // trigger() lets you validate individual fields on demand
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit", // default: validate on submit
  });

  const onSubmit = (data: FormValues) => {
    console.log(data); // [CUSTOMIZE] Replace with your submit handler
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email: validate on blur (critical field) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          onBlur={() => trigger("email")} {/* <-- on blur validation */}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Display name: validate on submit (non-critical) */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          Display name <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          {...register("displayName")}
          aria-describedby={errors.displayName ? "name-error" : undefined}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
            errors.displayName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.displayName && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Save
      </button>
    </form>
  );
}
```

### Async validation (username uniqueness)

```tsx
// Debounced server-side check on blur — show "Checking..." while pending
const [checking, setChecking] = useState(false);
const checkUsername = async (value: string) => {
  setChecking(true);
  const res = await fetch(`/api/check-username?q=${encodeURIComponent(value)}`); // [CUSTOMIZE]
  const { available } = await res.json();
  setChecking(false);
  return available || "This username is already taken";
};
// In React Hook Form: register("username", { validate: checkUsername })
// Show: {checking && <span className="text-xs text-gray-400">Checking...</span>}
```

### Password strength meter

```tsx
function getStrength(pw: string): { score: 0|1|2|3|4; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;
  return { score: s as 0|1|2|3|4, label: labels[s] };
}
// Usage: validate password onChange, show colored bar + label below the field
// Colors: 0-1 red, 2 yellow, 3-4 green
```

### Cross-field validation (password confirmation)

```tsx
// Zod: use .refine() to compare two fields
const signupSchema = z.object({
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // attaches error to confirmPassword field
});
```

---

## 3. Error display patterns

### When to use which error display

| Pattern | When to use | When NOT to use |
|---------|------------|-----------------|
| **Field-level inline** | Any field with validation rules | — |
| **Form-level summary** | Forms with >5 fields so users see all errors at once | Short forms where inline is enough |
| **Toast notification** | Server errors (500, timeout, network) | Validation errors — never use toasts for those |

### Error copywriting rules

| Bad (blames the user) | Good (blames the system) |
|-----------------------|--------------------------|
| "You entered an invalid email" | "We couldn't verify this email address" |
| "Invalid phone number" | "This doesn't look like a phone number — try including the area code" |
| "Password too short" | "Passwords need at least 8 characters for security" |
| "Required field" | "We need your name to create the account" |

### Copy-paste: ErrorMessage component

```tsx
type FieldErrorProps = {
  id: string;
  message: string | undefined;
};

/** Inline error — place directly below the input it describes */
function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}

type FormErrorSummaryProps = {
  errors: { field: string; id: string; message: string }[];
};

/** Summary banner — place at the top of the form when multiple fields have errors */
function FormErrorSummary({ errors }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      aria-label="Form errors"
      className="mb-6 rounded-md border border-red-300 bg-red-50 p-4"
    >
      <h2 className="text-sm font-semibold text-red-800">
        Please fix {errors.length} {errors.length === 1 ? "error" : "errors"} below
      </h2>
      <ul className="mt-2 list-inside list-disc text-sm text-red-700">
        {errors.map((err) => (
          <li key={err.id}>
            <a href={`#${err.id}`} className="underline hover:text-red-900">
              {err.field}
            </a>
            : {err.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. Button state machine

```
Button states:
  idle → hover → active → loading → success → error → idle
                                   ↘ idle (on timeout)     ↗
```

| State | Visual | Duration | User can click? |
|-------|--------|----------|-----------------|
| **idle** | Default label | Permanent until action | Yes |
| **hover** | Slightly darker background | While hovering | Yes |
| **loading** | Spinner + "Saving..." text, same button width | Until server responds | No (disabled) |
| **success** | Checkmark + "Saved" | 1.5 seconds then return to idle | No |
| **error** | Shake animation + "Failed" | 2 seconds then return to idle | No |

### Copy-paste: SubmitButton component

```tsx
import { useState, useCallback } from "react";

type ButtonStatus = "idle" | "loading" | "success" | "error";

type SubmitButtonProps = {
  label?: string;            // [CUSTOMIZE] default button text
  loadingLabel?: string;
  onClick: () => Promise<void>;
};

function SubmitButton({
  label = "Save changes",    // [CUSTOMIZE]
  loadingLabel = "Saving...",
  onClick,
}: SubmitButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>("idle");

  const handleClick = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await onClick();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [status, onClick]);

  const baseClasses =
    "relative inline-flex min-w-[120px] items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200";

  const statusClasses: Record<ButtonStatus, string> = {
    idle: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    loading: "bg-blue-400 text-white cursor-not-allowed",
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white animate-shake",
  };

  const statusLabels: Record<ButtonStatus, string> = {
    idle: label,
    loading: loadingLabel,
    success: "Saved ✓",
    error: "Failed — try again",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status !== "idle"}
      aria-busy={status === "loading"}
      className={`${baseClasses} ${statusClasses[status]}`}
    >
      {status === "loading" && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {statusLabels[status]}
    </button>
  );
}

/* Add to your global CSS or tailwind config for the shake animation:
   [CUSTOMIZE] adjust duration/distance as needed

   @keyframes shake {
     0%, 100% { transform: translateX(0); }
     20%, 60% { transform: translateX(-4px); }
     40%, 80% { transform: translateX(4px); }
   }
   .animate-shake { animation: shake 0.4s ease-in-out; }
*/
```

---

## 5. Autosave patterns

### When to autosave — decision table

| Scenario | Autosave? | Why |
|----------|-----------|-----|
| Draft blog post | Yes | Users expect drafts to survive browser crashes |
| Settings / preferences page | Yes | Small changes should persist without a save button |
| Long onboarding form (>2 min) | Yes | Prevents data loss on accidental navigation |
| Payment / checkout form | **No** | Users must explicitly confirm financial actions |
| Destructive action (delete account) | **No** | Requires intentional confirmation |
| Form with submit confirmation | **No** | Autosave conflicts with the review step |

### Copy-paste: useAutosave hook

```tsx
// [CUSTOMIZE] Replace the save function with your API call
import { useEffect, useRef, useState, useCallback } from "react";

type AutosaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

function useAutosave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  debounceMs = 2000 // [CUSTOMIZE] delay after last keystroke
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const retryRef = useRef<ReturnType<typeof setTimeout>>();
  const previousData = useRef<string>(JSON.stringify(data));
  const retryCount = useRef(0);

  const save = useCallback(async (current: T) => {
    setStatus("saving");
    try {
      await saveFn(current);
      setStatus("saved");
      retryCount.current = 0;
    } catch {
      if (retryCount.current < 2) {
        retryCount.current++;
        retryRef.current = setTimeout(() => save(current), 3000); // auto-retry after 3s
        setStatus("error"); // shows "Retrying..." while waiting
      } else {
        setStatus("error"); // shows "Failed to save" after 2 retries
        retryCount.current = 0;
      }
    }
  }, [saveFn]);

  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized === previousData.current) return;
    previousData.current = serialized;
    setStatus("unsaved"); // immediately mark dirty when data changes

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    timeoutRef.current = setTimeout(() => save(data), debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [data, debounceMs, save]);

  return status;
}

/** Status indicator — place in the form header or footer */
function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const labels: Record<AutosaveStatus, string> = {
    idle: "",
    unsaved: "Unsaved changes",
    saving: "Saving...",
    saved: "All changes saved",
    error: "Failed to save — retrying...",
  };

  if (status === "idle") return null;

  return (
    <span
      className={`text-xs ${
        status === "error" ? "text-red-500" : "text-gray-400"
      }`}
      aria-live="polite"
    >
      {labels[status]}
    </span>
  );
}
```

### Mixed-mode: autosave + explicit submit on the same page

Settings pages often mix autosaved fields (display name, timezone) with fields that need explicit confirmation (password, email change). Wrap each section in its own form.

```tsx
// [CUSTOMIZE] Split your settings into autosave vs explicit-submit sections
function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", timezone: "" });
  const autosaveStatus = useAutosave(profile, saveProfile); // autosaved

  return (
    <div className="space-y-8">
      {/* Section 1: Autosaved */}
      <section>
        <h2>Profile <AutosaveIndicator status={autosaveStatus} /></h2>
        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
      </section>

      {/* Section 2: Explicit submit — password changes are NEVER autosaved */}
      <form onSubmit={handlePasswordChange}>
        <h2>Change Password</h2>
        <input type="password" name="current" required />
        <input type="password" name="new" required />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
```

---

## 6. Conditional logic and dynamic fields

- If a selection reveals a text input (e.g., "Other") → show field with slide-down transition
- If a toggle enables/disables a section → show/hide but **preserve entered data** when hidden
- If the number of items is dynamic → use `useFieldArray` from React Hook Form

### Copy-paste: dynamic field array

```tsx
// [CUSTOMIZE] Replace item shape with your domain model
import { useFieldArray, useForm } from "react-hook-form";

type FormValues = { items: { name: string; quantity: number }[] };

function DynamicItemList() {
  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: { items: [{ name: "", quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))} className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-end gap-3">
          <input {...register(`items.${i}.name`, { required: true })}
            placeholder="Name" className="flex-1 rounded-md border px-3 py-2 text-sm" />
          <input {...register(`items.${i}.quantity`, { valueAsNumber: true })}
            type="number" min={1} className="w-20 rounded-md border px-3 py-2 text-sm" />
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(i)}
              className="text-sm text-red-600 hover:bg-red-50 rounded px-2 py-2">Remove</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", quantity: 1 })}
        className="rounded-md border border-dashed px-4 py-2 text-sm text-gray-600">+ Add item</button>
    </form>
  );
}
```

---

## 7. File upload UX

- [ ] Drag-and-drop zone with click-to-browse fallback
- [ ] Client-side validation (type + size) **before** uploading
- [ ] Progress bar (determinate for single, aggregate for batch)
- [ ] Image preview for images, filename for documents

### Copy-paste: FileUpload drop zone

```tsx
// [CUSTOMIZE] Adjust accepted types, max size, upload endpoint
import { useState, useRef } from "react";

const MAX_MB = 10; // [CUSTOMIZE]
const ACCEPTED = ["image/png", "image/jpeg", "application/pdf"]; // [CUSTOMIZE]

function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (!ACCEPTED.includes(f.type)) return alert(`${f.name}: type not accepted`);
      if (f.size > MAX_MB * 1024 * 1024) return alert(`${f.name}: exceeds ${MAX_MB}MB`);
      // [CUSTOMIZE] Upload valid file, track progress, show preview
    });
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <p className="text-sm text-gray-600">Drag files here or <span className="text-blue-600 font-medium">browse</span></p>
      <p className="mt-1 text-xs text-gray-400">PNG, JPEG, or PDF up to {MAX_MB}MB</p>
      <input ref={ref} type="file" multiple accept={ACCEPTED.join(",")}
        onChange={(e) => handleFiles(e.target.files)} className="hidden" />
    </div>
  );
}
```

---

## 8. Address and location fields

- International app → Country dropdown drives State/Province options (reset state on country change)
- Single country → hardcode country, skip dropdown
- Precise addresses → integrate autocomplete API (Google Places, Mapbox)

### Copy-paste: AddressForm shell

```tsx
// [CUSTOMIZE] Replace country/state data, wire autocomplete API to street input
import { useState } from "react";
type AddressData = { street: string; city: string; state: string; zip: string; country: string };
const STATES: Record<string, string[]> = {
  US: ["AL","AK","AZ","CA" /* [CUSTOMIZE] */], CA: ["AB","BC","ON" /* [CUSTOMIZE] */],
};
function AddressForm({ onChange }: { onChange: (d: AddressData) => void }) {
  const [a, setA] = useState<AddressData>({ street:"", city:"", state:"", zip:"", country:"US" });
  const up = (k: keyof AddressData, v: string) => {
    const next = { ...a, [k]: v, ...(k === "country" ? { state: "" } : {}) };
    setA(next); onChange(next);
  };
  return (
    <fieldset className="space-y-3">
      <select value={a.country} onChange={(e) => up("country", e.target.value)}
        className="rounded-md border px-3 py-2 text-sm">
        {["US","CA","GB"].map((c) => <option key={c}>{c}</option>)}
      </select>
      <input value={a.street} onChange={(e) => up("street", e.target.value)}
        placeholder="Street" className="w-full rounded-md border px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input value={a.city} onChange={(e) => up("city", e.target.value)}
          placeholder="City" className="rounded-md border px-3 py-2 text-sm" />
        <input value={a.zip} onChange={(e) => up("zip", e.target.value)}
          placeholder="ZIP" className="rounded-md border px-3 py-2 text-sm" />
      </div>
    </fieldset>
  );
}
```

---

## 9. Pre-submit checklist

### When to add a confirmation step

- If the action is irreversible (delete, publish, send) → always confirm
- If the form is multi-step → show a review summary before final submit
- If money is involved → show order summary with total before charging

### Copy-paste: ConfirmationDialog component

```tsx
// [CUSTOMIZE] Replace title, message, and action labels
type ConfirmationDialogProps = {
  open: boolean;
  title: string;              // [CUSTOMIZE] e.g., "Publish this post?"
  message: string;            // [CUSTOMIZE] e.g., "This will be visible to all users."
  confirmLabel?: string;      // [CUSTOMIZE] e.g., "Publish"
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 text-sm text-gray-600">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| **Placeholder-only labels** (no visible `<label>`) | Placeholder disappears on focus — users forget what the field is for. Fails accessibility audits. | Always use a visible `<label>` element above the field. Placeholders are hints, not labels. |
| **Validation on every keystroke** | Fires errors while the user is still typing "j" in an email field. Feels hostile. | Use on-blur for most fields. Use debounced on-change only for search/preview. |
| **Disabled submit button with no explanation** | Users see a grayed-out button and have no idea what is wrong. | Keep the button enabled. Show errors on click so users know what to fix. |
| **Resetting form on error** | Users lose all their input when a server error occurs. Enraging. | Preserve all field values on error. Only clear sensitive fields (passwords) after successful submit. |
| **Generic "Invalid input" errors** | Users cannot figure out what is wrong or how to fix it. | Write specific messages: "Email must include an @ and a domain (e.g., you@example.com)". |
| **Auto-advancing focus between fields** | Breaks backspace navigation, confuses screen readers, surprises users. | Let users press Tab to advance. Never auto-move focus except in OTP/PIN inputs. |
| **Required fields not marked** | Users submit, get errors, feel tricked. | Mark required fields with a red asterisk (*) and add "(required)" in the label for screen readers. |
| **No autosave on long forms** | Users lose 10 minutes of work when the browser crashes or they navigate away. | Add autosave with a 2-second debounce for any form that takes >2 minutes to complete (see Section 5). |

---

## Companion tools

- `anthropics/claude-code` -> `frontend-design` skill — Implement form components
- `bencium/bencium-marketplace` -> `controlled-ux-designer` — Visual form styling and design tokens
