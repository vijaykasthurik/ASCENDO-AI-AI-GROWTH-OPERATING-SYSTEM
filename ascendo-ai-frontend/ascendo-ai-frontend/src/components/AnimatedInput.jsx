import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function AnimatedInput({ label, type = 'text', value, onChange, required, name, autoComplete, dark = false, multiline = false, rows = 5 }) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const password = type === 'password'
  const Field = multiline ? 'textarea' : 'input'
  return (
    <label
      className={
        dark
          ? `relative block rounded-xl border transition-all duration-300 px-4 ${multiline ? 'py-3' : 'py-2'} bg-white/[0.03] ${focused ? 'border-teal ring-4 ring-teal/10 shadow-[0_0_24px_rgba(45,212,191,0.08)]' : 'border-line hover:border-white/20'}`
          : `relative block rounded-xl border transition-all duration-300 px-4 py-2 bg-white/50 ${focused ? 'border-primary ring-4 ring-primary/10 shadow-sm' : 'border-black/[0.06] hover:border-black/[0.12]'}`
      }
    >
      <Field
        className={
          dark
            ? `peer w-full resize-none bg-transparent pt-4 pb-1 text-sm font-semibold text-textLight outline-none ${multiline ? '' : ''}`
            : 'peer w-full bg-transparent pt-3.5 pb-0.5 text-sm font-semibold text-textDark outline-none'
        }
        type={multiline ? undefined : password && show ? 'text' : type}
        rows={multiline ? rows : undefined}
        value={value}
        name={name}
        required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        placeholder=" "
      />
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          focused || value
            ? `top-1 text-[9px] font-bold uppercase tracking-wider ${dark ? 'text-teal' : 'text-primary'}`
            : `${multiline ? 'top-3.5' : 'top-3'} text-sm ${dark ? 'text-muted' : 'text-textMuted'}`
        }`}
      >
        {label}
      </span>
      {password && (
        <button type="button" onClick={() => setShow(!show)} className={`absolute top-1/2 -translate-y-1/2 right-3 transition ${dark ? 'text-muted hover:text-teal' : 'text-textMuted hover:text-primary'}`} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </label>
  )
}
