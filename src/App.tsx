import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudSun,
  CreditCard,
  Gauge,
  IndianRupee,
  Leaf,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PackageCheck,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Sprout,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './index.css';

type BookingStatus = 'booked' | 'checked-in' | 'weighing' | 'procurement' | 'paid';
type View = 'overview' | 'book' | 'queue' | 'payments';

type Booking = {
  id: string;
  farmer_name: string;
  village: string;
  crop: string;
  quantity: number;
  slot: string;
  status: BookingStatus;
  token: string;
  priority: 'standard' | 'perishable' | 'express';
  payment_status: 'pending' | 'processing' | 'paid';
  created_at: string;
};

const seedBookings: Booking[] = [
  { id: 'demo-1', farmer_name: 'Ramesh Kumar', village: 'Rampur', crop: 'Wheat', quantity: 12.5, slot: '09:00 – 10:00 AM', status: 'checked-in', token: 'FF-041', priority: 'standard', payment_status: 'pending', created_at: new Date().toISOString() },
  { id: 'demo-2', farmer_name: 'Sita Devi', village: 'Khera', crop: 'Tomato', quantity: 4.2, slot: '09:00 – 10:00 AM', status: 'weighing', token: 'FF-042', priority: 'perishable', payment_status: 'processing', created_at: new Date().toISOString() },
  { id: 'demo-3', farmer_name: 'Harpreet Singh', village: 'Chandpur', crop: 'Mustard', quantity: 8.8, slot: '10:00 – 11:00 AM', status: 'booked', token: 'FF-043', priority: 'standard', payment_status: 'pending', created_at: new Date().toISOString() },
  { id: 'demo-4', farmer_name: 'Meena Patel', village: 'Lakshmi Nagar', crop: 'Onion', quantity: 6.4, slot: '10:00 – 11:00 AM', status: 'booked', token: 'FF-044', priority: 'perishable', payment_status: 'pending', created_at: new Date().toISOString() },
  { id: 'demo-5', farmer_name: 'Amit Yadav', village: 'Basantpur', crop: 'Wheat', quantity: 15, slot: '11:00 AM – 12:00 PM', status: 'booked', token: 'FF-045', priority: 'standard', payment_status: 'pending', created_at: new Date().toISOString() },
];

const slots = [
  { label: '09:00 – 10:00 AM', remaining: 3, load: 72, tone: 'mint' },
  { label: '10:00 – 11:00 AM', remaining: 6, load: 48, tone: 'blue' },
  { label: '11:00 AM – 12:00 PM', remaining: 8, load: 30, tone: 'blue' },
  { label: '01:00 – 02:00 PM', remaining: 10, load: 12, tone: 'blue' },
];

const navItems: { id: View; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'book', label: 'Book a slot', icon: CalendarDays },
  { id: 'queue', label: 'Live queue', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

function statusLabel(status: BookingStatus) {
  return { booked: 'Booked', 'checked-in': 'Checked in', weighing: 'Weighing', procurement: 'In procurement', paid: 'Paid' }[status];
}

function App() {
  const [view, setView] = useState<View>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({ name: '', village: '', crop: 'Wheat', quantity: '5', slot: '10:00 – 11:00 AM', phone: '' });

  useEffect(() => {
    let active = true;
    async function loadBookings() {
      const { data, error } = await supabase.from('fasalflux_bookings').select('*').order('created_at', { ascending: true });
      if (!active) return;
      if (error || !data?.length) {
        setBookings(seedBookings);
      } else {
        setBookings(data as Booking[]);
      }
      setIsLoading(false);
    }
    loadBookings();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const queue = useMemo(() => bookings.filter((booking) => booking.status !== 'paid'), [bookings]);
  const activeQueue = queue.filter((booking) => ['checked-in', 'weighing', 'procurement'].includes(booking.status));
  const paidBookings = bookings.filter((booking) => booking.payment_status === 'paid');
  const totalTonnes = bookings.reduce((sum, booking) => sum + Number(booking.quantity), 0);
  const avgWait = Math.max(8, 18 - Math.min(8, bookings.length));

  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      farmer_name: form.name,
      village: form.village,
      crop: form.crop,
      quantity: Number(form.quantity),
      slot: form.slot,
      status: 'booked',
      token: `FF-${String(46 + bookings.length).padStart(3, '0')}`,
      priority: ['Tomato', 'Onion', 'Potato'].includes(form.crop) ? 'perishable' : 'standard',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('fasalflux_bookings').insert({ ...newBooking, id: undefined }).select().maybeSingle();
    setBookings((current) => [...current, (data as Booking | null) ?? newBooking]);
    setIsSaving(false);
    setShowBookingForm(false);
    setForm({ name: '', village: '', crop: 'Wheat', quantity: '5', slot: '10:00 – 11:00 AM', phone: '' });
    setToast(error ? `Demo booking created. Token ${newBooking.token}` : `Booking confirmed. Token ${((data as Booking | null) ?? newBooking).token}`);
    setView('queue');
  }

  async function advanceBooking(booking: Booking) {
    const next: BookingStatus = booking.status === 'booked' ? 'checked-in' : booking.status === 'checked-in' ? 'weighing' : booking.status === 'weighing' ? 'procurement' : 'paid';
    const paymentStatus = next === 'paid' ? 'paid' : next === 'procurement' ? 'processing' : booking.payment_status;
    setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: next, payment_status: paymentStatus } : item));
    const { error } = await supabase.from('fasalflux_bookings').update({ status: next, payment_status: paymentStatus }).eq('id', booking.id);
    if (error) setToast('Demo updated locally. The live database is unavailable right now.');
    else setToast(`${booking.token} moved to ${statusLabel(next).toLowerCase()}.`);
  }

  function handleNav(nextView: View) {
    setView(nextView);
    setMobileNav(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Leaf size={22} strokeWidth={2.5} /></div>
          <div><strong>FasalFlux</strong><span>Smart mandi flow</span></div>
        </div>
        <div className="workspace-switcher"><span className="avatar avatar-green">MK</span><div><b>Mandi Khandwa</b><small>Operator workspace</small></div><ChevronRight size={16} /></div>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-caption">WORKSPACE</p>
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => handleNav(id)}><Icon size={18} /><span>{label}</span>{id === 'queue' && <em>{queue.length}</em>}</button>)}
          <p className="nav-caption nav-caption-spaced">TOOLS</p>
          <button className="nav-item" onClick={() => setToast('Alerts are clear. No critical mandi events right now.')}><Bell size={18} /><span>Alerts</span><span className="notification-dot" /></button>
          <button className="nav-item" onClick={() => setToast('Support desk is ready on the toll-free channel.')}><CircleHelp size={18} /><span>Help centre</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Phone size={16} /></div><div><b>Need help?</b><span>Talk to support</span></div><ArrowRight size={16} /></div><div className="profile-row"><span className="avatar avatar-dark">AR</span><div><b>Arjun Rao</b><small>Mandi administrator</small></div><MoreHorizontal size={18} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav((open) => !open)}><Menu size={20} /></button><div className="breadcrumbs"><span>FasalFlux</span><ChevronRight size={14} /><b>{navItems.find((item) => item.id === view)?.label}</b></div><div className="topbar-actions"><div className="search-box"><Search size={16} /><input placeholder="Search token, farmer..." /></div><button className="icon-button" onClick={() => setToast('All systems are operating normally.')}><Bell size={18} /><span className="alert-badge">2</span></button><div className="top-avatar">AR</div></div></header>

        <div className="page-content">
          {view === 'overview' && <Overview totalTonnes={totalTonnes} queue={queue} activeQueue={activeQueue} avgWait={avgWait} paidBookings={paidBookings} setView={setView} setShowBookingForm={setShowBookingForm} onAdvance={advanceBooking} />}
          {view === 'book' && <BookingView setShowBookingForm={setShowBookingForm} onBook={() => setShowBookingForm(true)} />}
          {view === 'queue' && <QueueView bookings={queue} onAdvance={advanceBooking} />}
          {view === 'payments' && <PaymentsView bookings={bookings} onAdvance={advanceBooking} />}
        </div>
      </main>

      {showBookingForm && <div className="modal-backdrop" onMouseDown={() => setShowBookingForm(false)}><div className="booking-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">FARMER ARRIVAL</span><h2>Book a mandi slot</h2><p>Reserve a predictable arrival window in under a minute.</p></div><button className="close-button" onClick={() => setShowBookingForm(false)}><X size={20} /></button></div><form onSubmit={createBooking}><div className="form-grid"><label>Farmer name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ramesh Kumar" /></label><label>Village / location<input required value={form.village} onChange={(event) => setForm({ ...form, village: event.target.value })} placeholder="e.g. Rampur" /></label><label>Mobile number<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="10-digit mobile number" /></label><label>Crop<select value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })}><option>Wheat</option><option>Mustard</option><option>Tomato</option><option>Onion</option><option>Potato</option></select></label><label>Expected quantity (tonnes)<input required min="0.1" step="0.1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label></div><div className="slot-picker"><div className="field-heading"><b>Choose a time slot</b><span><CloudSun size={15} /> Live capacity</span></div><div className="slot-options">{slots.map((slot) => <button type="button" key={slot.label} className={`slot-option ${form.slot === slot.label ? 'selected' : ''}`} onClick={() => setForm({ ...form, slot: slot.label })}><span>{slot.label}</span><small>{slot.remaining} spaces left</small><i><span style={{ width: `${slot.load}%` }} /></i></button>)}</div></div><div className="form-footer"><div className="secure-note"><ShieldCheck size={17} /><span>Fair queue access · No advance payment</span></div><button className="primary-button" disabled={isSaving}>{isSaving ? 'Confirming...' : 'Confirm booking'}<ArrowRight size={17} /></button></div></form></div></div>}
      {toast && <div className="toast"><div className="toast-check"><Check size={16} /></div><span>{toast}</span><button onClick={() => setToast('')}><X size={15} /></button></div>}
      {isLoading && <div className="loading-bar" />}
    </div>
  );
}

function Overview({ totalTonnes, queue, activeQueue, avgWait, paidBookings, setView, setShowBookingForm, onAdvance }: { totalTonnes: number; queue: Booking[]; activeQueue: Booking[]; avgWait: number; paidBookings: Booking[]; setView: (view: View) => void; setShowBookingForm: (show: boolean) => void; onAdvance: (booking: Booking) => void }) {
  return <>
    <section className="welcome-row"><div><p className="eyebrow">WEDNESDAY, 18 JUNE 2025 <span className="live-pill"><span /> LIVE</span></p><h1>Good morning, Arjun <span className="sun-word">.</span></h1><p className="page-subtitle">Here’s what’s happening at Mandi Khandwa today.</p></div><button className="primary-button" onClick={() => setShowBookingForm(true)}><CalendarDays size={17} /> Book a farmer slot</button></section>
    <section className="metric-grid"><MetricCard icon={Users} label="Arrivals today" value={String(queue.length + paidBookings.length)} meta="+12% vs yesterday" tone="green" trend="up" /><MetricCard icon={Clock3} label="Average wait time" value={`${avgWait} min`} meta="6 min better than target" tone="blue" trend="down" /><MetricCard icon={Gauge} label="Mandi capacity" value="72%" meta="Processing smoothly" tone="amber" progress={72} /><MetricCard icon={IndianRupee} label="Payments processed" value={`₹${(paidBookings.length * 24.8).toFixed(1)}k`} meta="Today · DBT verified" tone="violet" />
    </section>
    <section className="overview-grid"><div className="panel queue-panel"><div className="panel-heading"><div><span className="eyebrow">OPERATIONS</span><h2>Live mandi queue</h2></div><button className="text-button" onClick={() => setView('queue')}>View full queue <ArrowRight size={15} /></button></div><div className="queue-summary"><div className="queue-visual"><div className="queue-ring"><strong>{activeQueue.length}</strong><span>in process</span></div><div className="queue-legend"><span><i className="dot dot-green" /> Checked in <b>{queue.filter((item) => item.status === 'checked-in').length}</b></span><span><i className="dot dot-blue" /> Processing <b>{queue.filter((item) => ['weighing', 'procurement'].includes(item.status)).length}</b></span><span><i className="dot dot-gray" /> Upcoming <b>{queue.filter((item) => item.status === 'booked').length}</b></span></div></div><div className="capacity-chart"><div className="chart-header"><span>Today’s throughput</span><b>82.4 t <small>/ 120 t</small></b></div><div className="bar-chart">{[38, 52, 45, 68, 74, 88, 82, 94, 76, 85, 63, 52].map((height, index) => <i key={index} style={{ height: `${height}%` }} className={index === 7 ? 'highlight' : ''} />)}</div><div className="chart-axis"><span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span></div></div></div><div className="queue-table"><div className="table-row table-head"><span>Token</span><span>Farmer</span><span>Crop</span><span>Slot</span><span>Status</span><span /></div>{queue.slice(0, 4).map((booking) => <BookingRow key={booking.id} booking={booking} onAdvance={onAdvance} />)}</div></div><div className="side-stack"><div className="panel next-panel"><div className="panel-heading"><div><span className="eyebrow">NEXT UP</span><h2>Upcoming slots</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div>{slots.slice(0, 3).map((slot) => <div className="upcoming-slot" key={slot.label}><div className="slot-time"><b>{slot.label.split(' – ')[0]}</b><span>{slot.label.split(' – ')[1]}</span></div><div className="slot-load"><div><span>{slot.remaining} spaces left</span><b>{slot.load}%</b></div><div className="progress-track"><span style={{ width: `${slot.load}%` }} /></div></div></div>)}<button className="outline-button" onClick={() => setView('book')}>Manage slots <ChevronRight size={15} /></button></div><div className="quick-card"><div className="quick-icon"><Zap size={18} /></div><div><b>Capacity engine is active</b><span>Arrival load is automatically balancing across the day.</span></div></div></div></section>
    <section className="bottom-grid"><div className="impact-banner"><div className="impact-icon"><Sprout size={22} /></div><div><span className="eyebrow">WHY FASALFLUX</span><h3>Less waiting. More certainty.</h3><p>One shared view for farmers, mandi staff and procurement teams.</p></div><div className="impact-stats"><span><b>34%</b><small>less waiting</small></span><span><b>2.4x</b><small>faster processing</small></span><span><b>100%</b><small>payment visibility</small></span></div></div><div className="support-card"><MessageSquareText size={20} /><div><b>Farmer support is online</b><span>SMS and toll-free IVR are ready for feature-phone users.</span></div><ArrowRight size={17} /></div></section>
  </>;
}

function MetricCard({ icon: Icon, label, value, meta, tone, trend, progress }: { icon: typeof Activity; label: string; value: string; meta: string; tone: string; trend?: 'up' | 'down'; progress?: number }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={trend === 'up' ? 'positive' : trend === 'down' ? 'positive' : ''}>{trend === 'up' && '↗ '}{trend === 'down' && '↘ '}{meta}</small></div>{progress !== undefined && <div className="metric-progress"><span style={{ width: `${progress}%` }} /></div>}</div>; }

function BookingRow({ booking, onAdvance }: { booking: Booking; onAdvance: (booking: Booking) => void }) { return <div className="table-row"><span className="token"><QrCode size={14} />{booking.token}</span><span className="farmer-cell"><span className="mini-avatar">{booking.farmer_name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><b>{booking.farmer_name}</b><small>{booking.village}</small></span><span>{booking.crop}<small className="sub-cell">{booking.quantity} t</small></span><span>{booking.slot.split(' – ')[0]}<small className="sub-cell">{booking.slot.split(' – ')[1]}</small></span><span><span className={`status status-${booking.status}`}>{booking.status === 'checked-in' && <span className="status-dot" />}{statusLabel(booking.status)}</span></span><button className="row-action" onClick={() => onAdvance(booking)} aria-label={`Advance ${booking.token}`}><ChevronRight size={16} /></button></div>; }

function BookingView({ onBook, setShowBookingForm }: { onBook: () => void; setShowBookingForm: (show: boolean) => void }) { return <section className="empty-view"><div className="hero-card"><div className="hero-copy"><span className="eyebrow">SMART ARRIVAL PLANNING</span><h1>Give every farmer a better mandi day.</h1><p>Book a capacity-aware time slot, receive a digital token, and arrive when the mandi is ready.</p><div className="hero-actions"><button className="primary-button" onClick={onBook}><CalendarDays size={17} /> Start a booking</button><button className="ghost-button" onClick={() => setShowBookingForm(true)}>Book for a farmer <ArrowRight size={16} /></button></div></div><div className="hero-art"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-center"><Leaf size={32} /></div><div className="floating-card card-top"><Clock3 size={16} /><span><b>18 min</b><small>estimated wait</small></span></div><div className="floating-card card-bottom"><QrCode size={16} /><span><b>FF-046</b><small>digital token</small></span></div></div></div><div className="how-grid">{[['01', 'Choose a slot', 'Capacity updates in real time so farmers avoid crowded arrivals.'], ['02', 'Get a token', 'A simple digital token works across app, SMS and IVR.'], ['03', 'Track & get paid', 'Follow queue progress and see payment status in one place.']].map(([number, title, copy]) => <div className="how-card" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p><ArrowRight size={17} /></div>)}</div></section>; }

function QueueView({ bookings, onAdvance }: { bookings: Booking[]; onAdvance: (booking: Booking) => void }) { return <section><div className="section-heading"><div><span className="eyebrow">REAL-TIME OPERATIONS</span><h1>Live queue</h1><p className="page-subtitle">A single source of truth for every arrival at Mandi Khandwa.</p></div><div className="live-pill large"><span /> LIVE UPDATES</div></div><div className="queue-kpis"><div><Users size={18} /><b>{bookings.length}</b><span>total in queue</span></div><div><Clock3 size={18} /><b>18 min</b><span>average wait</span></div><div><PackageCheck size={18} /><b>{bookings.filter((booking) => booking.status === 'weighing').length}</b><span>at weighbridge</span></div><div><Truck size={18} /><b>{bookings.filter((booking) => booking.priority === 'perishable').length}</b><span>priority arrivals</span></div></div><div className="panel full-queue"><div className="queue-filter-row"><div className="filter-tabs"><button className="selected">All arrivals <b>{bookings.length}</b></button><button>Needs action <b>{bookings.filter((booking) => booking.status === 'booked').length}</b></button><button>Priority lane <b>{bookings.filter((booking) => booking.priority === 'perishable').length}</b></button></div><button className="outline-button"><Search size={15} /> Filter queue</button></div><div className="queue-table"><div className="table-row table-head"><span>Token</span><span>Farmer</span><span>Crop</span><span>Slot</span><span>Status</span><span /></div>{bookings.map((booking) => <BookingRow key={booking.id} booking={booking} onAdvance={onAdvance} />)}</div></div></section>; }

function PaymentsView({ bookings, onAdvance }: { bookings: Booking[]; onAdvance: (booking: Booking) => void }) { const total = bookings.filter((booking) => booking.payment_status === 'paid').reduce((sum, booking) => sum + Number(booking.quantity) * 2100, 0); return <section><div className="section-heading"><div><span className="eyebrow">TRANSPARENT PROCUREMENT</span><h1>Payments & procurement</h1><p className="page-subtitle">Track weight, quality and direct payment status without guesswork.</p></div><button className="primary-button" onClick={() => bookings.find((booking) => booking.status === 'procurement') && onAdvance(bookings.find((booking) => booking.status === 'procurement')!)}><IndianRupee size={17} /> Process next payment</button></div><div className="payment-hero"><div className="payment-total"><span>Paid out today</span><strong>₹{total.toLocaleString('en-IN')}</strong><small><span className="positive">↗ 18.4%</span> compared to yesterday</small></div><div className="payment-bars">{[42, 55, 46, 72, 62, 78, 86, 68, 92, 77].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="dbt-card"><ShieldCheck size={21} /><div><b>DBT verification active</b><span>All paid farmers receive a traceable digital receipt.</span></div></div></div><div className="panel payment-table"><div className="panel-heading"><div><span className="eyebrow">RECENT TRANSACTIONS</span><h2>Payment ledger</h2></div><button className="outline-button">Download report</button></div><div className="queue-table"><div className="table-row table-head"><span>Token</span><span>Farmer</span><span>Crop / weight</span><span>Amount</span><span>Payment</span><span /></div>{bookings.map((booking) => <div className="table-row" key={booking.id}><span className="token"><QrCode size={14} />{booking.token}</span><span className="farmer-cell"><span className="mini-avatar">{booking.farmer_name.slice(0, 2).toUpperCase()}</span><b>{booking.farmer_name}</b><small>{booking.village}</small></span><span>{booking.crop}<small className="sub-cell">{booking.quantity} tonnes</small></span><span className="amount">₹{(Number(booking.quantity) * 2100).toLocaleString('en-IN')}</span><span><span className={`status ${booking.payment_status === 'paid' ? 'status-paid' : booking.payment_status === 'processing' ? 'status-processing' : 'status-pending'}`}>{booking.payment_status === 'paid' ? 'Paid to bank' : booking.payment_status === 'processing' ? 'Processing' : 'Awaiting procurement'}</span></span><button className="row-action" onClick={() => onAdvance(booking)}><ChevronRight size={16} /></button></div>)}</div></div></section>; }

export default App;
