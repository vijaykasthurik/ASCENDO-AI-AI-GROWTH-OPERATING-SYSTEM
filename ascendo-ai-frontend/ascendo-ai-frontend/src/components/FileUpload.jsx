import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react'
import { useRef, useState } from 'react'

export default function FileUpload({ onChange }) {
  const [files, setFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef()

  const addFiles = (list) => {
    const nextList = Array.from(list)
    const next = [...files, ...nextList].slice(0, 6)
    setFiles(next)
    onChange?.(next)

    // Simulate upload progress for new files
    nextList.forEach((file) => {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))
      let p = 0
      const interval = setInterval(() => {
        p += Math.floor(Math.random() * 20) + 15
        if (p >= 100) {
          p = 100
          clearInterval(interval)
        }
        setUploadProgress((prev) => ({ ...prev, [file.name]: p }))
      }, 120)
    })
  }

  const remove = (index, fileName) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onChange?.(next)

    setUploadProgress((prev) => {
      const copy = { ...prev }
      delete copy[fileName]
      return copy
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`group w-full rounded-2xl border-2 border-dashed px-6 py-9 text-center transition duration-300 ${
          dragActive
            ? 'border-primary bg-primary/[0.05] shadow-[0_0_0_4px_rgba(242,98,46,0.1)]'
            : 'border-black/10 bg-white/40 hover:border-primary/40 hover:bg-primary/[0.04]'
        }`}
      >
        <motion.span
          animate={dragActive ? { y: -4 } : { y: 0 }}
          className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-peach/60 text-primary transition duration-300 group-hover:-translate-y-1"
        >
          <UploadCloud />
        </motion.span>
        <span className="block font-bold text-espresso">Drop your business files here</span>
        <span className="mt-1 block text-sm text-textMuted">PDF, Word, Excel, CSV or text · up to 10 MB</span>
      </button>
      <input ref={inputRef} className="hidden" type="file" multiple accept=".pdf,.txt,.xlsx,.xls,.csv,.docx" onChange={(e) => addFiles(e.target.files)} />

      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {files.map((file, i) => {
            const progress = uploadProgress[file.name] ?? 100
            const isCompleted = progress >= 100

            return (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="flex flex-col rounded-xl border border-black/[0.06] bg-white p-3 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-semibold text-espresso truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    {isCompleted && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                        <CheckCircle2 size={13} className="text-success shrink-0" />
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-textMuted">
                      {isCompleted ? 'Uploaded' : `${progress}%`}
                    </span>
                    <button type="button" onClick={() => remove(i, file.name)} className="text-textMuted hover:text-danger transition">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden mt-2">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-primary to-amber"
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
