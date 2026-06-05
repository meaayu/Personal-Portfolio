import React, { useState, memo } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Github, Instagram, Send } from 'lucide-react';

export default memo(function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSubmittingSent] = useState(false);

  const validate = () => {
    let newErrors = { name: '', email: '', message: '' };
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = '← name required'; isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) { newErrors.email = '← valid email needed'; isValid = false; }
    if (!formData.message.trim()) { newErrors.message = '← say something!'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate send
    setTimeout(() => {
        const sub = encodeURIComponent(`Hey Aayu — from ${formData.name}`);
        const body = encodeURIComponent(`${formData.message}\n\n— ${formData.name} (${formData.email})`);
        const mailtoHref = `mailto:itsaayush.m@gmail.com?subject=${sub}&body=${body}`;

        window.location.href = mailtoHref;
        setIsSubmittingSent(true);
        setIsSubmitting(false);

        // Reset after bit
        setTimeout(() => {
            setFormData({ name: '', email: '', message: '' });
            setIsSubmittingSent(false);
        }, 5000);
    }, 1200);
  };

  return (
    <section id="contact" className="pt-24 pb-16 max-w-[1100px] mx-auto px-6 md:px-10">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-14 relative inline-block"
      >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-accent" />
            <span className="font-hand text-[0.85rem] tracking-[0.2em] font-bold text-accent uppercase opacity-90">04 Contact</span>
         </div>
         <h2 className="font-marker text-[clamp(2.1rem,4.5vw,3.2rem)] text-ink leading-none -tracking-tight">Get in Touch</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <h3 className="font-marker text-[1.8rem] text-ink -tracking-wide">Drop me a line<span className="text-accent">.</span></h3>
          <p className="font-hand text-[1rem] leading-[1.8] text-ink-dim max-w-[440px]">
            Open to collaborations, commissions, and conversations about art and code.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {[
              { icon: <Mail size={18} />, label: 'itsaayush.m@gmail.com', href: 'mailto:itsaayush.m@gmail.com' },
              { icon: <Github size={18} />, label: 'github.com/meaayu', href: 'https://github.com/meaayu' },
              { icon: <Instagram size={18} />, label: '@m__aayu__', href: 'https://instagram.com/m__aayu__' }
            ].map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener' : undefined}
                className="group w-full font-hand text-[1rem] p-4 py-3.5 rounded-2xl border-2 border-pencil-light/65 bg-paper-light flex items-center gap-4 transition-all duration-300 hover:bg-accent/8 hover:border-accent/40 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:text-accent gpu will-change-transform"
              >
                <div className="p-2 bg-charcoal-warm/50 rounded-xl group-hover:bg-accent/10 transition-colors">
                  <span className="text-accent group-hover:scale-110 transition-transform block">{link.icon}</span>
                </div>
                <span className="text-ink-dim group-hover:text-accent transition-colors font-semibold tracking-wide">{link.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                   <Send size={14} className="rotate-45" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit} 
          className="flex flex-col gap-6 p-8 md:p-10 bg-paper-light relative rounded-2xl border-2 border-solid border-pencil-light overflow-visible group gpu shadow-[6px_6px_0_0_var(--color-pencil-light)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:border-accent transition-all duration-300"
        >
           {/* Tactical Paper Overhang */}
           <div className="absolute -top-4 md:-top-6 right-6 md:right-10 px-5 py-2 md:py-2.5 bg-accent text-charcoal font-bold border-2 border-pencil-light z-10 font-marker text-[0.7rem] md:text-[0.8rem] flex items-center justify-center tracking-[0.2em] shadow-[4px_4px_0_0_var(--color-pencil-light)] rotate-[4deg] rounded-sm transition-all duration-300 group-hover:rotate-[7deg] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_0_var(--color-pencil-dark)]">
             <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-6 md:w-8 h-3.5 md:h-4 bg-white/30 border border-white/40 -rotate-[8deg] transform shadow-sm z-20 backdrop-blur-sm rounded-[1px]"></div>
             MESSAGE_SLIP
           </div>

           <div className="flex flex-col gap-1.5 mt-2">
             <label htmlFor="name" className="font-hand text-[0.85rem] text-accent tracking-[0.1em] font-semibold pl-1 opacity-90 uppercase">Name —</label>
             <input
               type="text"
               id="name"
               required
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               placeholder="How should I address you?"
               className={cn(
                 "w-full bg-pencil-dark/15 border-2 border-pencil-light/50 p-3.5 px-4 rounded-xl font-hand text-[1rem] text-ink outline-none transition-all duration-300 placeholder:text-ink-faint/45",
                 "focus:border-accent/70 focus:bg-pencil-dark/25 focus:ring-4 focus:ring-accent/10 focus:shadow-xs",
                 errors.name && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10"
               )}
             />
           </div>

           <div className="flex flex-col gap-1.5">
             <label htmlFor="email" className="font-hand text-[0.85rem] text-accent tracking-[0.1em] font-semibold pl-1 opacity-90 uppercase">Email —</label>
             <input
               type="email"
               id="email"
               required
               value={formData.email}
               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
               placeholder="yourname@domain.com"
               className={cn(
                 "w-full bg-pencil-dark/15 border-2 border-pencil-light/50 p-3.5 px-4 rounded-xl font-hand text-[1rem] text-ink outline-none transition-all duration-300 placeholder:text-ink-faint/45",
                 "focus:border-accent/70 focus:bg-pencil-dark/25 focus:ring-4 focus:ring-accent/10 focus:shadow-xs",
                 errors.email && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10"
               )}
             />
           </div>

           <div className="flex flex-col gap-1.5 relative">
             <label htmlFor="message" className="font-hand text-[0.85rem] text-accent tracking-[0.1em] font-semibold pl-1 opacity-90 uppercase">Message —</label>
             <textarea
               id="message"
               required
               rows={4}
               value={formData.message}
               onChange={(e) => setFormData({ ...formData, message: e.target.value })}
               placeholder="Tell me about your project, ideas, or just say hi..."
               maxLength={500}
               className={cn(
                 "w-full bg-pencil-dark/15 border-2 border-pencil-light/50 p-3.5 px-4 rounded-xl font-hand text-[1rem] text-ink outline-none transition-all duration-300 resize-none placeholder:text-ink-faint/45 min-h-[130px]",
                 "focus:border-accent/70 focus:bg-pencil-dark/25 focus:ring-4 focus:ring-accent/10 focus:shadow-xs",
                 errors.message && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10"
               )}
             />
             <div className="flex justify-between items-center mt-2 px-1">
                <span className="font-caveat text-[0.9rem] text-red-400 font-bold tracking-wide">{errors.name || errors.email || errors.message}</span>
                <span className={cn("font-mono text-[0.65rem] text-ink-dim tracking-widest opacity-50")}>{formData.message.length} / 500</span>
             </div>
           </div>

           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             type="submit"
             disabled={isSubmitting}
             className={cn(
               "w-full md:w-auto self-end mt-2 p-4 px-12 font-marker tracking-widest text-[0.95rem] text-pencil-dark bg-accent rounded-xl shadow-[4px_4px_0_0_var(--color-pencil-light)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none cursor-pointer group flex items-center justify-center gap-3 border-2 border-solid border-pencil-light hover:border-accent hover:-translate-y-[2px] hover:-translate-x-[2px]",
               isSent && "text-white bg-green-600 border-green-700 shadow-[4px_4px_0_0_var(--color-pencil-light)]"
             )}
           >
             <AnimatePresence mode="wait">
               {isSubmitting ? (
                 <motion.div 
                   key="submitting"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex items-center gap-2"
                 >
                   DISPATCHING...
                 </motion.div>
               ) : isSent ? (
                 <motion.span 
                   key="sent"
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="font-bold flex items-center gap-2"
                 >
                   DELIVERED!
                 </motion.span>
               ) : (
                 <motion.div 
                   key="idle"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex items-center gap-3"
                 >
                   SEND_DISPATCH
                   <Send size={18} className="group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-300" />
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.button>


        </motion.form>
      </div>
    </section>
  );
});
