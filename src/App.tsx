import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight, Bell, Camera, ChartNoAxesColumnIncreasing, Check, ChevronDown,
  Clock3, Gamepad2, Home, Leaf, MapPin, Menu, Recycle, Search, Settings,
  ShieldCheck, Sparkles, UploadCloud, Users, X, Smartphone, Laptop, Battery,
  RotateCcw, Info, Wrench, Trash2, Heart, Trophy, MessageCircle, SlidersHorizontal,
} from 'lucide-react'

type NavKey = 'Home' | 'Identify' | 'Disposal Guide' | 'Collection Points' | 'My Impact' | 'Achievements' | 'Community' | 'Settings'
const navItems: { label: NavKey; icon: typeof Home }[] = [
  { label: 'Home', icon: Home }, { label: 'Identify', icon: Camera },
  { label: 'Disposal Guide', icon: Leaf }, { label: 'Collection Points', icon: MapPin },
  { label: 'My Impact', icon: ChartNoAxesColumnIncreasing }, { label: 'Achievements', icon: Gamepad2 },
  { label: 'Community', icon: Users }, { label: 'Settings', icon: Settings },
]
const demoPoints = [
  {
    name: 'TNPCB Official Recycler Directory',
    area: 'Tamil Nadu',
    distance: 'Statewide directory',
    type: 'Official directory'
  },
  {
    name: 'E-Waste Collection Services',
    area: 'Chennai',
    distance: 'Check local listings',
    type: 'Search required'
  },
  {
    name: 'Nearby E-Waste Recyclers',
    area: 'Tambaram and surrounding areas',
    distance: 'Check current listings',
    type: 'Search required'
  }
]
type Scan = {
  scanId: string
  category: string
  confidence: number
  filename: string
  createdAt: string
}

function App() {
  const [activeNav, setActiveNav] = useState<NavKey>('Home')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [period, setPeriod] = useState('This Month')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [pointQuery, setPointQuery] = useState('')
  const [guideFilter, setGuideFilter] = useState('All devices')
  const [communityLiked, setCommunityLiked] = useState<number[]>([2])
  const [displayName, setDisplayName] = useState('Teena')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const fileInput = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [history, setHistory] = useState<Scan[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const isNonEWaste =
    analysis?.prediction?.category === 'not_e_waste' ||
    analysis?.category === 'not_e_waste'

  const isUncertain =
    analysis?.prediction?.category === 'uncertain' ||
    analysis?.prediction?.model_status === 'low_confidence' ||
    analysis?.prediction?.modelStatus === 'low_confidence' ||
    analysis?.category === 'uncertain'


  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const response = await fetch('/api/history')
      if (!response.ok) throw new Error('Could not load scan history')
      const data = await response.json()
      setHistory(Array.isArray(data.items) ? data.items : [])
    } catch (error) {
      console.error('History loading failed:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    void loadHistory()
  }, [])

  async function analyzeImage() {
    const file = selectedFile
    if (!file) { setNotice('Please select the image again before analyzing.'); return }
    setAnalyzing(true); setAnalysis(null); setNotice('Analyzing image with the AI model…')
    try {
      const form = new FormData()
      form.append('image', file)
      const response = await fetch('/api/classify', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`)
      setAnalysis(data)
      await loadHistory()
      setNotice('Analysis completed successfully.')
    } catch (error) {
      setNotice(`Could not analyze image: ${error instanceof Error ? error.message : String(error)}`)
    } finally { setAnalyzing(false) }
  }

  function chooseFile(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setNotice('Please choose an image file such as JPG or PNG.'); return }
    if (file.size > 10 * 1024 * 1024) { setNotice('That image is over 10 MB. Please choose a smaller image.'); return }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setSelectedFile(file)
    setAnalysis(null)
    setFileName(file.name)
    setImagePreview(URL.createObjectURL(file))
    setNotice('Photo uploaded. Results below are a frontend demo, not an AI prediction.')
    setActiveNav('Identify')
  }
  function openFilePicker() { fileInput.current?.click() }
  function resetImage() { if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); setFileName(''); setNotice('') }
  function navigate(page: NavKey) { setActiveNav(page); setMobileNavOpen(false); setNotice(''); setSearchOpen(false) }
  const guideCatalog = [
    {
      title: 'Phones & tablets',
      category: 'Phones & tablets',
      keywords: 'phone smartphone tablet mobile data sim repair reuse recycle battery',
      tag: 'Protect your data',
      action: 'Erase personal data, remove SIM and memory cards, and use an authorised e-waste collection service.',
      repair: 'Ask a qualified technician about screen, charging-port or battery repairs.',
      reuse: 'Keep a working device as a backup or donate it after securely erasing your data.',
      recycle: 'Take unusable devices to an authorised e-waste collection point.',
      safety: 'Back up files, sign out of accounts and follow the manufacturer’s reset instructions.'
    },
    {
      title: 'Laptops & computers',
      category: 'Computers',
      keywords: 'laptop laptops computer desktop pc notebook data repair reuse recycle storage',
      tag: 'Repair or reuse',
      action: 'Consider repairing or donating working computers. Securely erase personal data before passing them on.',
      repair: 'Ask a technician to check the RAM, storage, screen, charger or battery.',
      reuse: 'Donate working equipment after securely erasing files and signing out of accounts.',
      recycle: 'Use an authorised e-waste recycler for unusable equipment.',
      safety: 'Disconnect power. Do not attempt to remove a swollen or damaged battery yourself.'
    },
    {
      title: 'Monitors & screens',
      category: 'Computers',
      keywords: 'monitor monitors screen display desktop LCD LED broken computer',
      tag: 'Protect the display',
      action: 'Check whether the monitor can be repaired before sending it for recycling.',
      repair: 'Ask a technician to inspect the power supply, cable or display fault.',
      reuse: 'Reuse a working monitor with a compatible computer or donate it.',
      recycle: 'Take unusable monitors to an authorised e-waste collection facility.',
      safety: 'Avoid dismantling the display. Handle broken screens carefully and follow local collection instructions.'
    },
    {
      title: 'Keyboards & mice',
      category: 'Cables & accessories',
      keywords: 'keyboard keyboards mouse mice wired wireless USB computer accessories',
      tag: 'Reuse small devices',
      action: 'Check whether the keyboard or mouse still works before deciding how to dispose of it.',
      repair: 'Try cleaning it according to the manufacturer’s instructions or ask about repair.',
      reuse: 'Keep working accessories or donate them with compatible computers.',
      recycle: 'Take unusable electronic accessories to an appropriate e-waste collection point.',
      safety: 'Disconnect wired accessories. Remove replaceable batteries and dispose of them through suitable battery collection.'
    },
    {
      title: 'Batteries & power banks',
      category: 'Batteries',
      keywords: 'battery batteries power bank lithium swollen hot leaking charging recycle safety',
      tag: 'Handle with care',
      action: 'Keep batteries away from household waste and use an appropriate battery collection service.',
      repair: 'Never attempt to open, crush, puncture or repair a battery yourself.',
      reuse: 'Reuse only undamaged batteries and power banks that function normally.',
      recycle: 'Use a designated battery collection service and follow its handling instructions.',
      safety: 'If a battery is swollen, hot, leaking or damaged, stop using it. Do not charge or handle it unnecessarily; seek specialist guidance.'
    },
    {
      title: 'Chargers & power adapters',
      category: 'Cables & accessories',
      keywords: 'charger chargers adapter adapters power supply phone laptop USB charging',
      tag: 'Check compatibility',
      action: 'Keep compatible working chargers and send unwanted electronic adapters to an appropriate collection service.',
      repair: 'Have a faulty adapter assessed by a qualified repair provider rather than opening it yourself.',
      reuse: 'Reuse or donate working chargers that meet the receiving device’s requirements.',
      recycle: 'Take unwanted or broken chargers to an authorised e-waste collection point.',
      safety: 'Do not use adapters with exposed wires, burn marks, unusual heat or damaged plugs.'
    },
    {
      title: 'Cables & accessories',
      category: 'Cables & accessories',
      keywords: 'cable cables wires headphones earphones accessories USB recycle',
      tag: 'Recycle responsibly',
      action: 'Gather unwanted electronic cables and accessories for suitable e-waste collection.',
      repair: 'Replace frayed or damaged power cables instead of continuing to use them.',
      reuse: 'Keep compatible working cables or donate them with the devices they support.',
      recycle: 'Use an appropriate e-waste collection point. Never burn cables to recover metal.',
      safety: 'Unplug cables before handling and avoid exposed wires or damaged connectors.'
    }
  ]
  const normalizedSearch = search.trim().toLowerCase()
  const searchGuideResults = normalizedSearch ? guideCatalog.filter(g => `${g.title} ${g.keywords} ${g.action} ${g.repair} ${g.reuse} ${g.recycle} ${g.safety}`.toLowerCase().includes(normalizedSearch)) : []
  const searchPointResults = normalizedSearch ? demoPoints.filter(p => `${p.name} ${p.area} ${p.type}`.toLowerCase().includes(normalizedSearch)) : []
  const filteredPoints = demoPoints.filter(p => `${p.name} ${p.area} ${p.type}`.toLowerCase().includes(pointQuery.toLowerCase()))

  return <div className="app-shell">
    <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => { chooseFile(e.target.files?.[0]); e.currentTarget.value = '' }} />
    <button type="button" className="mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">{mobileNavOpen ? <X size={21} /> : <Menu size={21} />}</button>
    <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('Home') }}><span className="brand-mark"><Leaf size={37} strokeWidth={1.4} /></span><span>E-WASTE<br /><b>RESCUE</b></span></a>
      <div className="sidebar-label">YOUR SPACE</div>
      <nav className="nav-list" aria-label="Main navigation">{navItems.map(({ label, icon: Icon }) => <button type="button" key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => navigate(label)}><Icon size={19} strokeWidth={1.8} /><span>{label}</span>{activeNav === label && <span className="nav-active-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-leaf-art"><Leaf size={42} /><Sparkles size={17} /></div><p>Small devices.<br /><em>Big change.</em></p><span className="tiny-stars">✦　·　✧</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="search-container" style={{ position: 'relative', flex: '1 1 560px', maxWidth: 720 }}><label className="search-box"><Search size={19} /><input value={search} onFocus={() => setSearchOpen(true)} onChange={e => { setSearch(e.target.value); setSearchOpen(true) }} placeholder="Search devices, disposal tips, or locations..." onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); if (e.key === 'Enter' && normalizedSearch) { if (searchGuideResults[0]) { setSelectedGuide(searchGuideResults[0].title); navigate('Disposal Guide') } else if (searchPointResults[0]) { setPointQuery(searchPointResults[0].area); navigate('Collection Points') } else if (normalizedSearch.includes('point') || normalizedSearch.includes('location')) navigate('Collection Points') } }} />{search && <button type="button" className="clear-search" onClick={() => { setSearch(''); setSearchOpen(false) }} aria-label="Clear search"><X size={15} /></button>}</label>{searchOpen && normalizedSearch && <div role="listbox" aria-label="Search results" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 50, background: '#fffaf1', border: '1px solid #e8d6b9', borderRadius: 14, boxShadow: '0 12px 30px rgba(30,50,35,.15)', padding: 8, maxHeight: 340, overflowY: 'auto', color: '#123d31' }}>{searchGuideResults.map(g => <button type="button" key={g.title} onClick={() => { setSelectedGuide(g.title); navigate('Disposal Guide'); setSearch(g.title) }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', padding: '12px 14px', borderRadius: 9, cursor: 'pointer', color: 'inherit' }}><strong>{g.title}</strong><div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>Disposal guide · {g.action}</div></button>)}{searchPointResults.map(point => <button type="button" key={point.name} onClick={() => { setPointQuery(point.area); navigate('Collection Points'); setSearch(point.name) }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', padding: '12px 14px', borderRadius: 9, cursor: 'pointer', color: 'inherit' }}><strong>{point.name}</strong><div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>Collection point · {point.area} · demo listing</div></button>)}{searchGuideResults.length === 0 && searchPointResults.length === 0 && <div style={{ padding: 14, fontSize: 13 }}>No matching guides or sample locations. Try “laptop”, “battery”, “phone” or “Chennai”.</div>}</div>}</div><div className="top-actions"><button type="button" className="icon-button notification" aria-label="Notifications" onClick={() => setNotice('You’re all caught up! No new notifications.')}><Bell size={19} /><span /></button><button type="button" className="profile-pill" onClick={() => navigate('Settings')}><span className="avatar">{displayName.slice(0, 1).toUpperCase()}</span><span className="profile-text">Hello,<b>{displayName}</b></span><ChevronDown size={16} /></button></div></header>

      {activeNav === 'Home' && <>
        <section className="hero"><div className="hero-text"><div className="eyebrow"><span>IDENTIFY</span><i /><span>DISPOSE</span><i /><span>RECYCLE</span></div><h1>E-WASTE<br /><span>RESCUE</span></h1><h2>Small Devices. Big Impact.</h2><p>Identify e-waste, find the right disposal options,<br className="desktop-break" /> and help build a greener tomorrow.</p><button type="button" className="gold-button" onClick={() => navigate('Identify')}>Identify E-Waste <ArrowRight size={17} /></button></div><div className="hero-art" aria-hidden="true"><div className="art-orb orb-one" /><div className="art-orb orb-two" /><div className="hero-leaf leaf-one"><Leaf size={88} /></div><div className="hero-leaf leaf-two"><Leaf size={54} /></div><div className="hero-recycle"><Recycle size={64} /></div><div className="hero-quote">CLEANER<br />COMMUNITIES<br /><b>BRIGHTER FUTURES</b><span>— ✦ —</span></div><span className="hero-spark spark-one">✦</span><span className="hero-spark spark-two">✧</span></div><div className="hero-bottom-note">A LITTLE ACTION GOES A LONG WAY</div></section>
        <section className="feature-grid"><FeatureCard icon={<Camera />} title="AI Identification" description="Upload a photo of your device." onClick={() => navigate('Identify')} /><FeatureCard icon={<Recycle />} title="Disposal Guide" description="Choose repair, reuse or recycling." onClick={() => navigate('Disposal Guide')} /><FeatureCard icon={<MapPin />} title="Collection Points" description="Explore nearby drop-off locations." onClick={() => navigate('Collection Points')} /></section>
        <section className="dashboard-grid"><div className="panel upload-panel"><PanelTitle icon={<Camera size={19} />} title="Upload a Photo" /><UploadBox imagePreview={imagePreview} fileName={fileName} openFilePicker={openFilePicker} resetImage={resetImage} chooseFile={chooseFile} />{notice && <Notice text={notice} clear={() => setNotice('')} />}</div>
          <div className="panel impact-panel"><div className="panel-heading-row"><PanelTitle icon={<Leaf size={19} />} title="Your Impact" /><select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Impact period"><option>This Month</option><option>This Year</option><option>All Time</option></select>
            <div className="impact-stats">
              <ImpactStat
                icon={<Recycle />}
                value={String(
                  history.filter(scan => {
                    const date = new Date(scan.createdAt)
                    const now = new Date()
                    if (period === 'This Month') {
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }
                    if (period === 'This Year') {
                      return date.getFullYear() === now.getFullYear()
                    }
                    return true
                  }).length
                )}
                label="Items Identified"
              />
              <ImpactStat
                icon={<Leaf />}
                value="—"
                label="E-Waste Diverted"
              />
              <ImpactStat
                icon={<Sparkles />}
                value="—"
                label="Verified Badges"
              />
            </div>
          </div><div className="progress-row"><div className="progress-track"><span /></div><span>Keep going! <Sparkles size={15} /></span></div><p className="demo-label">Counts based on saved scan history</p></div>

          <div className="recent-list">
            {historyLoading && history.length === 0 && (
              <p>Loading recent identifications...</p>
            )}

            {!historyLoading && history.length === 0 && (
              <p>No identifications yet. Upload an image to get started.</p>
            )}

            {history.slice(0, 5).map((scan) => (
              <RecentItem
                key={scan.scanId}
                device={scan.category}
                confidence={`${Math.round(scan.confidence * 100)}% similarity`}
                status="Review guidance"
                statusType="recycle"
                date={new Date(scan.createdAt).toLocaleDateString()}
              />
            ))}
          </div>
          <p className="demo-label">
            Saved identifications from your local backend
          </p>

          <div className="panel map-panel"><div className="section-heading"><PanelTitle icon={<MapPin size={19} />} title="Nearby Collection Points" /><button type="button" className="text-link" onClick={() => navigate('Collection Points')}>View points <ArrowRight size={15} /></button></div><div className="map-preview"><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-water" />{[{ x: '17%', y: '38%' }, { x: '36%', y: '22%' }, { x: '55%', y: '52%' }, { x: '72%', y: '28%' }].map((p, i) => <div key={i} className="map-pin" style={{ left: p.x, top: p.y }}><Recycle size={14} /></div>)}<div className="map-place-card"><span className="place-icon"><Recycle size={17} /></span><span><b>Green Earth Centre</b><small>Example collection point · 1.2 km</small></span><ArrowRight size={17} /></div><span className="map-disclaimer">Illustrative map preview</span></div></div></section>
      </>}

      {activeNav === 'Identify' && <section className="content-page"><PageHeading eyebrow="E-WASTE RESCUE / IDENTIFY" title="Device Identification" description="Upload an electronic device photo to prepare it for identification and disposal guidance." />{!imagePreview ? <div className="panel identify-upload-card"><div className="identify-empty-icon"><Camera size={38} /></div><h2>Let's identify your e-waste</h2><p>Choose a clear photo of a phone, laptop, battery, cable or another electronic device.</p><button type="button" className="gold-button" onClick={openFilePicker}><UploadCloud size={18} /> Choose a photo <ArrowRight size={17} /></button><small>JPG, PNG or WEBP · Maximum 10 MB</small></div> : <><div className="results-topline"><div><span className="result-kicker"><Check size={15} /> PHOTO UPLOADED</span><h2>Your device report</h2><p>{fileName}</p></div><button type="button" className="secondary-button" onClick={openFilePicker}><RotateCcw size={16} /> Change photo</button></div><div className="results-grid"><div className="panel result-image-panel"><div className="result-panel-heading"><Camera size={18} /><h3>Your uploaded image</h3></div><div className="result-image-wrap"><img src={imagePreview} alt={fileName} /></div><p className="image-filename">{fileName}</p><button type="button" className="outline-button" onClick={resetImage}><X size={16} /> Remove image</button></div><div className="panel result-details-panel"><span className="demo-result-label"><Info size={15} /> {analysis ? "AI CLASSIFICATION RESULT" : "READY TO ANALYZE"}</span><h2>
        {!analysis
          ? "Ready for identification"
          : isNonEWaste
            ? "Possible non-e-waste item"
            : (analysis.prediction?.category || analysis.category || "Unknown")
              .replaceAll("_", " ")}
      </h2><p className="result-description">
          {!analysis
            ? "Click Analyze image to send this photo to your local AI backend."
            : isNonEWaste
              ? "This image may not show electronic waste. Please upload a clear photo of an electronic item."
              : `Similarity score: ${analysis.prediction?.confidence ?? analysis.prediction?.score ?? analysis.confidence ?? analysis.score ?? "Not provided"}`}
        </p><button type="button" className="gold-button" onClick={analyzeImage} disabled={analyzing || !selectedFile}>{analyzing ? "Analyzing…" : "Analyze image"} <ArrowRight size={17} /></button>{analysis && !isNonEWaste && <><ResultRow icon={<Smartphone />} label="DEVICE CATEGORY" value={String(analysis.prediction?.category || analysis.category || "Unknown").replaceAll("_", " ")} /><ResultRow icon={<Recycle />} label="RECOMMENDED ACTION" value={analysis.guidance?.action || analysis.guidance?.recycle || analysis.disposalGuide?.action || "See disposal guidance below."} />
          <button
            type="button"
            className="secondary-button"
            onClick={openMatchingGuide}
            style={{ marginTop: 12 }}
          >
            <Recycle size={17} />
            View Disposal Guide
            <ArrowRight size={17} />
          </button>
          <ResultRow icon={<ShieldCheck />} label="MODEL STATUS" value={analysis.prediction?.modelStatus || analysis.modelStatus || "Prediction returned"} />{(analysis.prediction?.notice || analysis.prediction?.model_status) && (
            <div className="result-notice">
              <Info size={17} />
              <p>
                {analysis.prediction?.notice ||
                  'Please verify the predicted category before disposal.'}
              </p>
            </div>
          )}<div className="result-notice"><Info size={17} /><p>AI predictions can be wrong. Verify the item and follow local disposal guidance.</p></div></>}{analysis && !isNonEWaste && !isUncertain && (
              <div className="result-notice" role="alert">
              <Info size={17} />
              <p>
                This image may not be electronic waste. No disposal guide is
                recommended. Please upload a clear image of an electronic item.
              </p>
            </div>
          )}</div></div><Checklist onGuide={() => navigate('Disposal Guide')} onPoints={() => navigate('Collection Points')} /></>}</section>}

      {activeNav === 'Disposal Guide' && <section className="content-page"><PageHeading eyebrow="REPAIR · REUSE · RECYCLE" title="Disposal Guide" description="A device's next step depends on its condition, battery safety and local recycling rules." />
        {selectedGuide ? (() => {
          const guide = guideCatalog.find(g => g.title === selectedGuide); if (!guide) return null; const GuideIcon = guide.category === 'Phones & tablets' ? Smartphone : guide.category === 'Computers' ? Laptop : guide.category === 'Batteries' ? Battery : Recycle; return <div className="panel" style={{ padding: 24, marginTop: 20 }}>
            <button type="button" className="text-link" onClick={() => setSelectedGuide(null)}><ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to all guides</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}><div className="guide-icon"><GuideIcon /></div><div><span className="guide-tag">{guide.tag}</span><h2 style={{ margin: '8px 0 0' }}>{guide.title}</h2></div></div><p style={{ lineHeight: 1.7, marginTop: 14 }}>{guide.action}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginTop: 20 }}>{[{ heading: 'Repair', body: guide.repair, Icon: Wrench }, { heading: 'Reuse', body: guide.reuse, Icon: Heart }, { heading: 'Recycle', body: guide.recycle, Icon: Recycle }, { heading: 'Safety', body: guide.safety, Icon: ShieldCheck }].map(({ heading, body, Icon }) => <div key={heading} style={{ background: '#fff8ed', border: '1px solid #ead8bb', borderRadius: 13, padding: 16 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9b7429' }}><Icon size={19} /><strong style={{ color: '#123d31' }}>{heading}</strong></div><p style={{ lineHeight: 1.65, fontSize: 14, marginBottom: 0 }}>{body}</p></div>)}</div>
            {guide.category === 'Batteries' && <div className="battery-warning" style={{ marginTop: 18 }}><ShieldCheck size={20} /><div><b>Important battery safety</b><p>If a battery is swollen, hot, leaking or damaged, do not charge, puncture or handle it unnecessarily. Seek specialist guidance.</p></div></div>}
            <div className="result-actions" style={{ marginTop: 20 }}><button type="button" className="gold-button" onClick={() => navigate('Collection Points')}>Find a collection point <ArrowRight size={17} /></button><button type="button" className="secondary-button" onClick={() => setSelectedGuide(null)}>Browse other devices</button></div>
          </div>
        })() : <>
          <div className="filter-row"><SlidersHorizontal size={18} /><label htmlFor="guide-filter">Browse by device</label><select id="guide-filter" value={guideFilter} onChange={e => setGuideFilter(e.target.value)}><option>All devices</option><option>Phones & tablets</option><option>Computers</option><option>Batteries</option><option>Cables & accessories</option></select></div>
          <div className="guide-grid">{guideCatalog.filter(item => guideFilter === 'All devices' || item.category === guideFilter).map(item => { const GuideIcon = item.category === 'Phones & tablets' ? Smartphone : item.category === 'Computers' ? Laptop : item.category === 'Batteries' ? Battery : Recycle; return <article role="button" tabIndex={0} aria-label={`Open ${item.title} disposal guide`} className="panel guide-card" key={item.title} onClick={() => setSelectedGuide(item.title)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedGuide(item.title) } }} style={{ cursor: 'pointer' }}><div className="guide-icon"><GuideIcon /></div><span className="guide-tag">{item.tag}</span><h2>{item.title}</h2><p>{item.action}</p><button type="button" className="text-link" onClick={e => { e.stopPropagation(); navigate('Collection Points') }}>Find a collection point <ArrowRight size={15} /></button><span style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#9b7429' }}>Select card to view full guide →</span></article> })}</div>
          <div className="battery-warning"><ShieldCheck size={20} /><div><b>Important battery safety</b><p>If a battery is swollen, hot, leaking or damaged, do not charge, puncture or handle it unnecessarily. Seek guidance from an appropriate battery collection or hazardous-waste service.</p></div></div>
        </>}</section>}

      {activeNav === 'Collection Points' && <section className="content-page"><PageHeading eyebrow="DISPOSE RESPONSIBLY" title="Collection Points" description="Explore sample Chennai collection listings. These are demo entries, not verified real-world locations." /><div className="point-search"><Search size={19} /><input value={pointQuery} onChange={e => setPointQuery(e.target.value)} placeholder="Search by centre, area or type..." /></div><div className="panel" style={{ padding: 18, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Find a collection service</h3>
        <p>
          Check official recycler information and search for collection
          services near your area. Confirm acceptance of your device
          and operating hours before visiting.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <a
            className="gold-button"
            href="https://tnpcb.gov.in/PDF/Updates/Whats_New/Recyclers_Directory_2025.pdf"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            Official TNPCB directory <ArrowRight size={17} />
          </a>

          <a
            className="secondary-button"
            href="https://www.google.com/maps/search/e-waste+recycling+centre+Chennai/"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            Search on Maps <MapPin size={17} />
          </a>
        </div>

        <small style={{ display: 'block', marginTop: 12 }}>
          Map search results are not automatically verified. Contact a
          service before travelling.
        </small>
      </div><div className="points-layout"><div className="points-list">{filteredPoints.map((point, i) => <article className="panel point-card" key={point.name}><div className="point-symbol"><Recycle size={22} /></div><div className="point-copy"><span className="guide-tag">{point.type}</span><h3>{point.name}</h3><p><MapPin size={14} />{point.area}</p><small>{point.distance} · Demo distance</small></div><button type="button" className="icon-button" aria-label={`View ${point.name}`} onClick={() => setNotice(`${point.name} is a demo listing. Verify the address and opening hours before visiting.`)}><ArrowRight size={18} /></button></article>)}{filteredPoints.length === 0 && <div className="panel empty-state">No sample locations match that search. Try a different area or centre name.</div>}</div><div className="panel points-map"><div className="map-preview"><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-water" />{[{ x: '24%', y: '30%' }, { x: '56%', y: '48%' }, { x: '72%', y: '25%' }].map((p, i) => <div key={i} className="map-pin" style={{ left: p.x, top: p.y }}><Recycle size={14} /></div>)}<span className="map-disclaimer">Illustrative map — not live navigation</span></div><p className="map-note"><Info size={16} /> Listings and distances are placeholders. Connect a maps API and verified recycler dataset before your demo.</p></div></div></section>}


      {activeNav === 'My Impact' && (
        <section className="content-page">
          <PageHeading
            eyebrow="YOUR ENVIRONMENTAL JOURNEY"
            title="My Impact"
            description="Track your identified e-waste items and your progress toward responsible disposal."
          />

          <div className="impact-summary-grid">
            <ImpactTile
              icon={<Recycle />}
              number={String(history.length)}
              label="Items identified"
            />
            <ImpactTile
              icon={<Leaf />}
              number="Not measured"
              label="E-waste diverted"
            />
            <ImpactTile
              icon={<Sparkles />}
              number="—"
              label="Verified badges"
            />
            <ImpactTile
              icon={<Heart />}
              number="—"
              label="Helpful actions"
            />
          </div>

          <div className="panel" style={{ padding: 24, marginTop: 20 }}>
            <h2>Your monthly journey</h2>
            <p>Number of items identified each month</p>

            {history.length === 0 ? (
              <p>No saved scans yet. Analyze an image to begin tracking your journey.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 12,
                alignItems: 'end',
                minHeight: 180
              }}>
                {Array.from({ length: 4 }, (_, index) => {
                  const now = new Date()
                  const monthDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - (3 - index),
                    1
                  )
                  const count = history.filter(scan => {
                    const date = new Date(scan.createdAt)
                    return date.getMonth() === monthDate.getMonth() &&
                      date.getFullYear() === monthDate.getFullYear()
                  }).length
                  const maxCount = Math.max(
                    1,
                    ...Array.from({ length: 4 }, (_, i) => {
                      const d = new Date(
                        now.getFullYear(),
                        now.getMonth() - (3 - i),
                        1
                      )
                      return history.filter(scan => {
                        const date = new Date(scan.createdAt)
                        return date.getMonth() === d.getMonth() &&
                          date.getFullYear() === d.getFullYear()
                      }).length
                    })
                  )

                  return (
                    <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                      style={{ textAlign: 'center' }}>
                      <b>{count}</b>
                      <div style={{
                        height: `${Math.max(8, count / maxCount * 110)}px`,
                        background: '#4c8b68',
                        borderRadius: '8px 8px 0 0',
                        marginTop: 8
                      }} />
                      <small>{monthDate.toLocaleDateString('en', { month: 'short' })}</small>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}



      {activeNav === 'Achievements' && <section className="content-page"><PageHeading eyebrow="SMALL ACTIONS ADD UP" title="Achievements" description="Celebrate good habits. Demo badges are shown here until user activity is stored." /><div className="achievement-grid">{[{ icon: <Leaf />, title: 'Green Beginner', desc: 'Explore the e-waste guide', done: true }, { icon: <Camera />, title: 'Photo Explorer', desc: 'Upload your first device photo', done: !!imagePreview }, { icon: <Recycle />, title: 'Circular Thinker', desc: 'Learn about responsible recycling', done: false }, { icon: <MapPin />, title: 'Local Eco Scout', desc: 'Explore a collection point', done: false }, { icon: <ShieldCheck />, title: 'Safety First', desc: 'Review battery safety tips', done: false }, { icon: <Trophy />, title: 'Community Champion', desc: 'Share a helpful sustainability tip', done: false }].map(b => <article className={`panel achievement-card ${b.done ? 'earned' : ''}`} key={b.title}><div className="achievement-icon">{b.icon}</div><span className="achievement-status">{b.done ? 'DEMO UNLOCKED' : 'LOCKED PREVIEW'}</span><h3>{b.title}</h3><p>{b.desc}</p></article>)}</div></section>}

      {activeNav === 'Community' && <section className="content-page"><PageHeading eyebrow="LEARN TOGETHER" title="Community" description="Share ideas that make repair, reuse and responsible recycling easier." /><div className="panel community-compose"><div className="community-avatar">{displayName.slice(0, 1).toUpperCase()}</div><div><h3>Good ideas deserve to be shared</h3><p>Community posting will be connected to the backend later. For now, explore sample posts and try the like buttons.</p></div></div><div className="community-feed">{[{ id: 1, initial: 'A', name: 'Ananya', time: '2 hours ago', title: 'Before replacing your phone, check if the battery can be replaced safely.', tag: 'Repair first', likes: 18 }, { id: 2, initial: 'R', name: 'Rahul', time: 'Yesterday', title: 'Keep old charging cables in a separate box so they can be dropped off together.', tag: 'Small habit', likes: 24 }, { id: 3, initial: 'M', name: 'Meera', time: '2 days ago', title: 'Remember to remove personal data from laptops before donating or recycling them.', tag: 'Data safety', likes: 31 }].map(post => <article className="panel community-post" key={post.id}><div className="post-top"><div className="community-avatar">{post.initial}</div><div><b>{post.name}</b><small>{post.time}</small></div><span className="guide-tag">{post.tag}</span></div><p>{post.title}</p><button type="button" className={`like-button ${communityLiked.includes(post.id) ? 'liked' : ''}`} onClick={() => setCommunityLiked(old => old.includes(post.id) ? old.filter(id => id !== post.id) : [...old, post.id])}><Heart size={17} fill={communityLiked.includes(post.id) ? 'currentColor' : 'none'} />{post.likes + (communityLiked.includes(post.id) ? 1 : 0)} helpful</button></article>)}</div></section>}

      {activeNav === 'Settings' && <section className="content-page"><PageHeading eyebrow="YOUR PREFERENCES" title="Settings" description="Manage your local demo profile and interface preferences." /><div className="panel settings-card"><div className="settings-section"><div className="settings-section-icon"><Users size={20} /></div><div className="settings-fields"><h3>Profile</h3><label>Display name<input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your name" /></label><p>Your name updates in the profile menu. Account sign-in will be added with authentication later.</p></div></div><div className="settings-section"><div className="settings-section-icon"><Bell size={20} /></div><div className="settings-fields"><h3>Notifications</h3><p>Choose whether the demo should show notification reminders.</p><label className="toggle-row"><span>Enable notification reminders</span><input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} /></label></div></div><div className="settings-section"><div className="settings-section-icon"><ShieldCheck size={20} /></div><div className="settings-fields"><h3>Privacy & data</h3><p>Uploaded images stay in this browser session; no backend storage is connected in this frontend demo.</p><button type="button" className="secondary-button" onClick={() => { resetImage(); setNotice('The current uploaded image was cleared from the page.') }}><Trash2 size={16} /> Clear uploaded image</button></div></div><button type="button" className="gold-button" onClick={() => setNotice('Your demo preferences are active for this session.')}>Save preferences <Check size={17} /></button></div></section>}

      {notice && <Notice text={notice} clear={() => setNotice('')} />}
      <footer className="footer"><span>✦ E-WASTE RESCUE</span><span>Small devices. Big impact.</span><span>Made for a greener tomorrow <Leaf size={13} /></span></footer>
    </main>
  </div>
}
function openMatchingGuide() {
  if (!analysis) return

  const category = String(
    analysis.prediction?.category || analysis.category || ''
  ).toLowerCase().replaceAll('_', ' ')

  let guideTitle = ''

  if (
    category.includes('phone') ||
    category.includes('mobile') ||
    category.includes('tablet')
  ) {
    guideTitle = 'Phones & tablets'
  } else if (
    category.includes('laptop') ||
    category.includes('computer') ||
    category.includes('desktop') ||
    category.includes('monitor') ||
    category.includes('screen')
  ) {
    guideTitle = category.includes('monitor') || category.includes('screen')
      ? 'Monitors & screens'
      : 'Laptops & computers'
  } else if (
    category.includes('battery') ||
    category.includes('power bank')
  ) {
    guideTitle = 'Batteries & power banks'
  } else if (
    category.includes('keyboard') ||
    category.includes('mouse') ||
    category.includes('mice')
  ) {
    guideTitle = 'Keyboards & mice'
  } else if (
    category.includes('charger') ||
    category.includes('adapter')
  ) {
    guideTitle = 'Chargers & power adapters'
  } else if (
    category.includes('cable') ||
    category.includes('wire') ||
    category.includes('headphone') ||
    category.includes('earphone')
  ) {
    guideTitle = 'Cables & accessories'
  }

  const matchingGuide = guideCatalog.find(
    guide => guide.title === guideTitle
  )

  if (matchingGuide) {
    setSelectedGuide(matchingGuide.title)
    navigate('Disposal Guide')
  } else {
    setNotice(
      'No exact guide is available for this detected category. Please browse all disposal guides.'
    )
    navigate('Disposal Guide')
  }
}

function UploadBox({ imagePreview, fileName, openFilePicker, resetImage, chooseFile }: { imagePreview: string | null; fileName: string; openFilePicker: () => void; resetImage: () => void; chooseFile: (file?: File) => void }) {
  return <div className={`upload-zone ${imagePreview ? 'has-preview' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); chooseFile(e.dataTransfer.files[0]) }}>{imagePreview ? <><img src={imagePreview} alt="Uploaded electronic device" className="image-preview" /><div className="preview-info"><Check size={17} /><span>{fileName}</span></div><div className="upload-actions"><button type="button" className="change-image" onClick={openFilePicker}>Change image</button><button type="button" className="change-image" onClick={resetImage}>Remove</button></div></> : <><div className="upload-icon"><UploadCloud size={35} strokeWidth={1.5} /></div><strong>Drop your device photo here</strong><span>or <button type="button" className="browse-button" onClick={openFilePicker}>browse files</button> to choose an image</span><small>JPG, PNG or WEBP · Maximum 10 MB</small><button type="button" className="gold-button upload-cta" onClick={openFilePicker}><UploadCloud size={17} /> Choose a photo <ArrowRight size={17} /></button></>}</div>
}
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div> }
function Notice({ text, clear }: { text: string; clear: () => void }) { return <div className="notice" role="status">{text}<button type="button" onClick={clear} aria-label="Dismiss"><X size={14} /></button></div> }
function ResultRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="result-detail-row"><span className="result-detail-icon">{icon}</span><div><small>{label}</small><b>{value}</b></div></div> }
function Checklist({ onGuide, onPoints }: { onGuide: () => void; onPoints: () => void }) { return <div className="panel disposal-checklist"><div className="result-panel-heading"><ShieldCheck size={20} /><h3>Safe disposal checklist</h3></div><p>Follow these general precautions before taking electronics to a collection centre.</p><div className="checklist-items"><ChecklistItem>Back up your data and erase personal information.</ChecklistItem><ChecklistItem>Remove SIM cards and removable memory cards.</ChecklistItem><ChecklistItem>Check for swollen, damaged or leaking batteries.</ChecklistItem><ChecklistItem>Use an authorised e-waste collection facility.</ChecklistItem></div><div className="battery-warning"><ShieldCheck size={19} /><div><b>Battery safety matters</b><p>Do not put electronics or batteries in ordinary household rubbish. Seek specialist advice for swollen or leaking batteries.</p></div></div><div className="result-actions"><button type="button" className="gold-button" onClick={onGuide}>Explore disposal guide <ArrowRight size={17} /></button><button type="button" className="secondary-button" onClick={onPoints}><MapPin size={17} /> Find collection points</button></div></div> }
function ChecklistItem({ children }: { children: ReactNode }) { return <div className="checklist-item"><Check size={18} /><span>{children}</span></div> }
function FeatureCard({ icon, title, description, onClick }: { icon: ReactNode; title: string; description: string; onClick: () => void }) { return <button type="button" className="feature-card" onClick={onClick}><span className="feature-icon">{icon}</span><span className="feature-copy"><b>{title}</b><small>{description}</small></span><span className="feature-arrow"><ArrowRight size={17} /></span></button> }
function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) { return <div className="panel-title"><span>{icon}</span><h2>{title}</h2></div> }
function ImpactStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) { return <div className="impact-stat"><span className="stat-icon">{icon}</span><div><b>{value}</b><small>{label}</small></div></div> }
function RecentItem({ device, confidence, status, statusType, date }: { device: string; confidence: string; status: string; statusType: string; date: string }) { return <div className="recent-item"><div className={`device-thumb ${device.toLowerCase()}`}><span>{device === 'Laptop' ? '▰' : '▯'}</span></div><div className="device-info"><b>{device}</b><small>{confidence}</small></div><span className={`status-pill ${statusType}`}>{status}</span><time>{date}</time></div> }
function ImpactTile({ icon, number, label }: { icon: ReactNode; number: string; label: string }) { return <div className="panel impact-tile"><span className="stat-icon">{icon}</span><b>{number}</b><span>{label}</span></div> }
export default App
