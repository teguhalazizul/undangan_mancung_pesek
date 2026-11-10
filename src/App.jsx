import { useEffect, useMemo, useRef, useState } from 'react'
import { config as c } from './config.js'

/* ---------- Bunga SVG ---------- */
function Flower({ size = 90, petals = 6, hue = 'pink', className = '', style }) {
  const fills = { pink: ['#f7b6c8', '#e98aa8'], peach: ['#ffd2a6', '#f2a066'], lilac: ['#d8c4e8', '#a98bc7'] }[hue]
  const id = useMemo(() => 'g' + Math.random().toString(36).slice(2, 7), [])
  return (
    <svg className={`flower ${className}`} style={{ width: size, height: size, ...style }} viewBox="-50 -50 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="50%" cy="80%" r="80%">
          <stop offset="0" stopColor={fills[1]} /><stop offset="1" stopColor={fills[0]} />
        </radialGradient>
      </defs>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={i} cx="0" cy="-22" rx="13" ry="24" fill={`url(#${id})`} opacity=".92" transform={`rotate(${(360 / petals) * i})`} />
      ))}
      <circle r="9" fill="#f8d98a" /><circle r="4.5" fill="#e9b24f" />
    </svg>
  )
}

/* Kelopak jatuh */
function Petals() {
  const items = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: Math.random() * 100, size: 10 + Math.random() * 14, dur: 9 + Math.random() * 10,
    delay: -Math.random() * 18, sway: 30 + Math.random() * 70, hue: ['#f7b6c8', '#ffd6b0', '#f2a9bf', '#e6d2f0'][i % 4],
  })), [])
  return (
    <div className="petals" aria-hidden="true">
      {items.map((p, i) => (
        <span key={i} style={{ left: p.left + '%', width: p.size, height: p.size, background: p.hue, animationDuration: p.dur + 's', animationDelay: p.delay + 's', '--sway': p.sway + 'px' }} />
      ))}
    </div>
  )
}

/* Karangan bunga sudut */
function Corner({ pos }) {
  return (
    <div className={`corner ${pos}`} aria-hidden="true">
      <Flower size={120} petals={7} hue="pink" className="bloom" style={{ '--d': '0s' }} />
      <Flower size={80} petals={5} hue="peach" className="bloom" style={{ '--d': '.25s', position: 'absolute', top: 70, left: 90 }} />
      <Flower size={64} petals={6} hue="lilac" className="bloom" style={{ '--d': '.5s', position: 'absolute', top: 10, left: 105 }} />
      <Flower size={56} petals={5} hue="pink" className="bloom" style={{ '--d': '.7s', position: 'absolute', top: 110, left: 20 }} />
    </div>
  )
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: delay + 's' }}>{children}</div>
}

function Countdown() {
  const target = new Date(c.date).getTime()
  const calc = () => { const d = Math.max(0, target - Date.now()); return { Hari: Math.floor(d / 864e5), Jam: Math.floor(d / 36e5) % 24, Menit: Math.floor(d / 6e4) % 60, Detik: Math.floor(d / 1e3) % 60 } }
  const [t, setT] = useState(calc)
  useEffect(() => { const i = setInterval(() => setT(calc()), 1000); return () => clearInterval(i) }, [])
  return (
    <div className="countdown">
      {Object.entries(t).map(([k, v]) => (<div key={k}><b>{String(v).padStart(2, '0')}</b><span>{k}</span></div>))}
    </div>
  )
}

function Rsvp({ guest }) {
  const [name, setName] = useState(guest || '')
  const [status, setStatus] = useState('Hadir')
  const [msg, setMsg] = useState('')
  const send = (e) => {
    e.preventDefault()
    const text = `Halo, saya ${name}.\nKonfirmasi: ${status}\nUcapan: ${msg}`
    window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`, '_blank')
  }
  return (
    <form className="rsvp" onSubmit={send}>
      <input required placeholder="Nama kamu" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="choice">
        {['Hadir', 'Tidak hadir'].map((s) => (
          <button type="button" key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s}</button>
        ))}
      </div>
      <textarea rows="3" placeholder="Tulis ucapan & doa" value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button className="btn" type="submit">Kirim lewat WhatsApp</button>
    </form>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const openInvitation = () => {
    setOpen(true)
    const a = audioRef.current
    if (a) a.play().then(() => setPlaying(true)).catch(() => {})
  }
  const toggleMusic = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) { a.play(); setPlaying(true) } else { a.pause(); setPlaying(false) }
  }
  const guest = new URLSearchParams(window.location.search).get('to') || ''
  useEffect(() => { document.body.style.overflow = open ? '' : 'hidden' }, [open])
  const dateStr = new Date(c.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

  return (
    <>
      <audio ref={audioRef} src={c.music} loop preload="auto" />
      {open && (
        <button className={`music ${playing ? 'on' : ''}`} onClick={toggleMusic} aria-label={playing ? 'Matikan musik' : 'Putar musik'}>
          {playing ? '♪' : '♪̸'}
        </button>
      )}
      {/* COVER */}
      <section className={`cover ${open ? 'gone' : ''}`}>
        <img src="/couple.jpg" alt="Cici dan Valdi" className="cover-img" />
        <div className="cover-shade" />
        <Petals />
        <div className="cover-title">
          <h1 className="script">Bila Aku Bersamamu</h1>
          <p>{c.bride.name} <span>❤</span> {c.groom.name}</p>
        </div>
        <div className="cover-box">
          <p className="small">Kepada Yth.</p>
          <p className="guest">{guest || 'Bapak/Ibu/Saudara/i'}</p>
          <button className="btn" onClick={openInvitation}>Buka Undangan</button>
        </div>
      </section>

      {open && (
        <main>
          <Petals />
          {/* HERO */}
          <section className="hero">
            <img src="/couple.jpg" alt="" className="hero-img" />
            <div className="hero-shade" />
            <div className="hero-text">
              <p className="small light">The Wedding of</p>
              <h1 className="script">{c.bride.name} <i>&amp;</i> {c.groom.name}</h1>
              <p className="light">{dateStr}</p>
            </div>
            <div className="scroll-hint" aria-hidden="true">⌄</div>
          </section>

          {/* PEMBUKA */}
          <section className="sec cream">
            <Corner pos="tl" /><Corner pos="br" />
            <Reveal><p className="script big">Bismillahirrahmanirrahim</p></Reveal>
            <Reveal delay={0.15}><p className="quote">{c.quote}</p></Reveal>
            <Reveal delay={0.3}><p className="tag">Undangan untuk keluarga besar {c.group}</p></Reveal>
          </section>

          {/* MEMPELAI */}
          <section className="sec blush">
            <Reveal><h2 className="script big">Mempelai</h2></Reveal>
            <div className="couple">
              {[c.bride, c.groom].map((p, i) => (
                <Reveal key={p.name} delay={i * 0.2} className="person">
                  <div className="arch">
                    <img src={p.photo} alt={p.name} />
                    <Flower size={70} className="bloom spin" petals={6} hue={i ? 'lilac' : 'pink'} style={{ position: 'absolute', bottom: -18, right: -14, '--d': '.4s' }} />
                    <Flower size={46} className="bloom spin" petals={5} hue="peach" style={{ position: 'absolute', top: 6, left: -12, '--d': '.7s' }} />
                  </div>
                  <h3>{p.full}</h3>
                  <p className="nick">{p.nick}</p>
                  <p>{p.parents}</p>
                </Reveal>
              ))}
            </div>
            <Reveal><div className="heart">❤</div></Reveal>
          </section>

          {/* ACARA */}
          <section className="sec cream">
            <Corner pos="tr" /><Corner pos="bl" />
            <Reveal><h2 className="script big">Save the Date</h2></Reveal>
            <Reveal delay={0.1}><Countdown /></Reveal>
            <div className="events">
              {c.events.map((e, i) => (
                <Reveal key={e.title} delay={i * 0.2} className="event">
                  <h3>{e.title}</h3>
                  <p className="date">{dateStr}</p>
                  <p>{e.time}</p>
                  <p><strong>{e.place}</strong></p>
                  <p className="addr">{e.address}</p>
                </Reveal>
              ))}
            </div>
            <Reveal><a className="btn" href={c.mapsUrl} target="_blank" rel="noreferrer">Lihat Lokasi</a></Reveal>
          </section>

          {/* RSVP */}
          <section className="sec blush">
            <Reveal><h2 className="script big">Konfirmasi Kehadiran</h2></Reveal>
            <Reveal delay={0.15}><Rsvp guest={guest} /></Reveal>
          </section>

          {/* PENUTUP */}
          <section className="sec closing">
            <Reveal>
              <p className="quote light">Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
              <h2 className="script big light">{c.bride.name} &amp; {c.groom.name}</h2>
              <p className="light small">Keluarga besar {c.group}</p>
            </Reveal>
            <div className="garden" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <Flower key={i} size={60 + (i % 3) * 22} petals={5 + (i % 3)} hue={['pink', 'peach', 'lilac'][i % 3]} className="sway" style={{ '--d': i * 0.3 + 's' }} />
              ))}
            </div>
          </section>
        </main>
      )}
    </>
  )
}
