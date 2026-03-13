import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useChatBot } from "../../hooks/useChatBot";

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-slate-400"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, error, sendMessage, clearMessages } = useChatBot();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#A0C82E]/20 flex items-center justify-center text-base">
                  🤖
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">Asistente MyManag</p>
                  <p className="text-slate-400 text-[10px]">Responde dudas del sistema</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/10 transition-colors text-xs"
                    title="Limpiar conversación"
                  >
                    🗑
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 min-h-0">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-6">
                  <span className="text-4xl">💬</span>
                  <p className="text-slate-500 text-sm">
                    Hola, soy tu asistente.<br />
                    ¿En qué te puedo ayudar?
                  </p>
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {[
                      "¿Cómo registro una venta?",
                      "¿Cómo apruebo una compra?",
                      "¿Cómo transfiero productos?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { sendMessage(q); }}
                        className="text-xs text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#A0C82E]/10 hover:text-[#8db526] border border-slate-200 hover:border-[#A0C82E]/40 transition-colors text-slate-600"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#A0C82E] text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-slate-100 flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                rows={1}
                className="flex-1 resize-none text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#A0C82E] transition-colors bg-slate-50 text-slate-800 placeholder-slate-400 max-h-24 overflow-y-auto"
                style={{ lineHeight: "1.5" }}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                whileTap={{ scale: 0.92 }}
                className="w-8 h-8 rounded-xl bg-[#A0C82E] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#8db526] transition-colors mb-0.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-90">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={open ? { rotate: 0 } : { rotate: 0 }}
        className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center text-xl hover:bg-slate-800 transition-colors border-2 border-white/10"
        aria-label="Abrir asistente"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-base leading-none"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl leading-none"
            >
              🤖
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatBot;
