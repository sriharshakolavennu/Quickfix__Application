// QuickFix backend: Express + JSON-file database. Run: npm install && npm start
const express=require('express'),fs=require('fs'),crypto=require('crypto'),path=require('path');
const F=process.env.DATA_FILE||path.join(__dirname,'data.json'),SECRET=process.env.SECRET||'change-this-secret-in-production';
const AREAS=['Gachibowli','Madhapur','Kukatpally','Banjara Hills'];
const CAT={clean:[399,549,699],cook:[299,399,499],baby:[499,649,799],plumb:[99,149,199],elec:[99,149,199],remodel:[0,0,0],ac:[249,349,449],appl:[99,149,199],carp:[149,199,249],pest:[299,449,599],tank:[349,499,599],ride:[49,79,99],pkg:[29,39,49],move:[299,449,599],emerg:[149,199,249]};
const COM=['ride','pkg','move','emerg'];
const hs=(p,s=crypto.randomBytes(8).toString('hex'))=>s+':'+crypto.scryptSync(p,s,32).toString('hex');
const chk=(p,x)=>{const a=Buffer.from(hs(p,x.split(':')[0])),b=Buffer.from(x);return a.length==b.length&&crypto.timingSafeEqual(a,b)};
const clean=(s,n=200)=>String(s==null?'':s).replace(/[<>&"'`]/g,'').slice(0,n);
const rnd=()=>''+(1000+crypto.randomInt(9000));
let db;try{db=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
const save=()=>fs.writeFileSync(F,JSON.stringify(db));
if(!db){db={users:{'9999999999':{name:'Admin',role:'Admin',pw:hs('admin123')}},workers:[],bookings:[],complaints:[],msgs:[],prices:{},rules:{free:2,late:50,otw:100},seq:1001};
 [['Ravi Kumar',['plumb','elec','ac','appl'],['Gachibowli','Madhapur'],4.8],['Lakshmi Devi',['clean','cook','baby','pest'],['Madhapur','Kukatpally'],4.9],['Suresh Reddy',['plumb','elec','remodel','carp','tank'],['Kukatpally','Banjara Hills'],4.4],['Anitha Rao',['clean','baby','cook','pest','tank','ac'],['Gachibowli','Banjara Hills'],4.6]]
 .forEach((w,i)=>{const ph='900000000'+(i+1);db.users[ph]={name:w[0],role:'Worker',pw:hs('worker123')};db.workers.push({id:i+1,ph,name:w[0],sk:[...w[1],...COM],ar:w[2],rt:w[3],on:1,st:'Active',pen:0})});save()}
const mac=b=>crypto.createHmac('sha256',SECRET).update(b).digest('hex');
const sign=p=>{const b=p+'.'+(Date.now()+7*864e5);return b+'.'+mac(b)};
const E=(s,m,c=400)=>s.status(c).json({e:m});
function auth(q,s,n){const t=(q.headers.authorization||'').replace('Bearer ','').split('.');
 if(t.length!=3||+t[1]<Date.now()||mac(t[0]+'.'+t[1])!==t[2]||!db.users[t[0]])return E(s,'Please login',401);
 q.ph=t[0];q.u=db.users[t[0]];q.w=db.workers.find(w=>w.ph==t[0]);n()}
const need=r=>(q,s,n)=>q.u.role==r?n():E(s,'Not allowed',403);
function bk(q,s){const b=db.bookings.find(x=>x.id==q.params.id);if(!b){E(s,'Booking not found',404);return}
 if(q.u.role=='Customer'&&b.ph!=q.ph||q.u.role=='Worker'&&b.wid!=(q.w&&q.w.id)){E(s,'Not allowed',403);return}return b}
const A=express();A.use(express.json({limit:'2mb'}));A.use(express.static(path.join(__dirname,'public')));
const fails={};
A.post('/api/signup',(q,s)=>{const{name,phone,password,role,skill,area}=q.body||{};
 if(!name||!/^\d{10}$/.test(phone)||typeof password!='string'||password.length<6)return E(s,'Enter name, 10-digit phone and a 6+ character password');
 if(db.users[phone])return E(s,'Phone already registered');if(!['Customer','Worker'].includes(role))return E(s,'Invalid role');
 if(role=='Worker'){if(!CAT[skill]||!AREAS.includes(area))return E(s,'Choose a valid skill and area');db.workers.push({id:db.workers.length+1,ph:phone,name:clean(name,60),sk:[skill],ar:[area],rt:4,on:1,st:'Pending approval',pen:0})}
 db.users[phone]={name:clean(name,60),role,pw:hs(password)};save();s.json({token:sign(phone),role,name:clean(name,60)})});
A.post('/api/login',(q,s)=>{const{phone,password}=q.body||{},u=db.users[phone],f=fails[phone]||(fails[phone]={n:0,t:Date.now()});
 if(Date.now()-f.t>9e5){f.n=0;f.t=Date.now()}if(f.n>=5)return E(s,'Too many attempts. Try again in 15 minutes.',429);
 if(!u||typeof password!='string'||!chk(password,u.pw)){f.n++;return E(s,'Wrong phone or password',401)}f.n=0;s.json({token:sign(phone),role:u.role,name:u.name})});
A.get('/api/state',auth,(q,s)=>{const r=q.u.role,U={};let B,W,C=[],M=[];const nk=({otp1,otp2,...b})=>b;
 if(r=='Admin'){B=db.bookings.map(nk);W=db.workers;C=db.complaints;M=db.msgs;Object.entries(db.users).forEach(([p,u])=>U[p]={name:u.name})}
 else if(r=='Customer'){B=db.bookings.filter(b=>b.ph==q.ph);W=db.workers.filter(w=>B.some(b=>b.wid==w.id))}
 else{B=db.bookings.filter(b=>q.w&&b.wid==q.w.id).map(nk);W=q.w?[q.w]:[];B.forEach(b=>U[b.ph]={name:(db.users[b.ph]||{}).name})}
 W.forEach(w=>U[w.ph]={name:w.name});U[q.ph]={name:q.u.name};
 s.json({role:r,ph:q.ph,state:{workers:W,bookings:B,complaints:C,msgs:M,users:U,rules:db.rules,prices:db.prices}})});
A.post('/api/bookings',auth,need('Customer'),(q,s)=>{const{sv,sub,area,hrs,pay}=q.body||{},p=db.prices[sv]||CAT[sv];
 if(!p||!AREAS.includes(area)||!['Online','Offline'].includes(pay))return E(s,'Invalid booking');
 const t=Math.min(db.bookings.filter(b=>b.ph==q.ph&&b.st!='Cancelled').length,2);
 const w=db.workers.filter(w=>w.on&&w.st=='Active'&&w.sk.includes(sv)&&w.ar.includes(area)).sort((a,b)=>b.rt-a.rt)[0];
 if(!w)return E(s,'No worker available in that area right now');
 const b={id:'QF-'+db.seq++,ph:q.ph,sv,sub:clean(sub,40),area,hrs:+hrs||24,price:p[t],pay,wid:w.id,st:'Confirmed',date:new Date().toLocaleDateString('en-IN'),otp1:rnd(),otp2:rnd(),earn:Math.round(p[2]*.8),tier:t+1};
 db.bookings.unshift(b);save();s.json({id:b.id})});
A.post('/api/bookings/:id/cancel',auth,need('Customer'),(q,s)=>{const b=bk(q,s);if(!b)return;if(['Completed','Cancelled','In progress'].includes(b.st))return E(s,'Cannot cancel now');
 b.fee=b.st=='On the way'?db.rules.otw:b.hrs<db.rules.free?db.rules.late:0;b.refund=Math.max(b.price-b.fee,0);b.st='Cancelled';save();s.json({ok:1})});
A.post('/api/bookings/:id/trip',auth,need('Worker'),(q,s)=>{const b=bk(q,s);if(!b)return;if(b.st!='Confirmed')return E(s,'Trip already started');b.st='On the way';save();s.json({ok:1})});
A.post('/api/bookings/:id/photo',auth,need('Worker'),(q,s)=>{const b=bk(q,s);if(!b)return;const{kind,data}=q.body||{};
 if(!['before','after'].includes(kind)||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data||'')||data.length>900000)return E(s,'Invalid photo');
 if(kind=='before'&&!['Confirmed','On the way'].includes(b.st)||kind=='after'&&b.st!='In progress')return E(s,'Photo not allowed at this stage');b[kind]=data;save();s.json({ok:1})});
A.post('/api/bookings/:id/start',auth,need('Worker'),(q,s)=>{const b=bk(q,s);if(!b)return;if(b.st!='On the way')return E(s,'Start the trip first');
 if(!b.before)return E(s,'Upload the before-work photo first');if(String((q.body||{}).otp)!==b.otp1)return E(s,'Incorrect OTP');b.st='In progress';b.t0=Date.now();save();s.json({ok:1})});
A.post('/api/bookings/:id/finish',auth,need('Worker'),(q,s)=>{const b=bk(q,s);if(!b)return;if(b.st!='In progress')return E(s,'Job is not in progress');
 if(!b.after)return E(s,'Upload the after-work photo first');if(String((q.body||{}).otp)!==b.otp2)return E(s,'Incorrect OTP');
 const n=(db.prices[b.sv]||CAT[b.sv])[2],g=Math.round(b.price*.18);b.mins=Math.max(1,Math.round((Date.now()-b.t0)/6e4));
 b.bill={no:'INV-'+b.id.slice(3),date:new Date().toLocaleDateString('en-IN'),n,d:n-b.price,g,tot:b.price+g};b.st='Completed';save();s.json({ok:1})});
A.post('/api/bookings/:id/pay',auth,(q,s)=>{const b=bk(q,s);if(!b)return;if(!b.bill||b.paid)return E(s,'Nothing to pay');
 if(q.u.role=='Customer'){if(b.pay!='Online')return E(s,'This booking is paid in cash');const m=(q.body||{}).method;b.method=['UPI','Card','Net banking'].includes(m)?m:'UPI';b.txn='TXN'+crypto.randomInt(1e9)}
 else if(q.u.role=='Worker'){if(b.pay!='Offline')return E(s,'Customer pays online');b.method='Cash'}else return E(s,'Not allowed',403);
 b.paid=1;save();s.json({ok:1})});
A.post('/api/bookings/:id/rate',auth,need('Customer'),(q,s)=>{const b=bk(q,s),n=+(q.body||{}).n;if(!b)return;if(b.st!='Completed'||b.rated||!(n>=1&&n<=5))return E(s,'Cannot rate');
 const w=db.workers.find(x=>x.id==b.wid);b.rated=n;w.rt=+((w.rt*9+n)/10).toFixed(2);if(w.rt<3.5)w.st='Suspension review';save();s.json({ok:1})});
A.post('/api/complaints',auth,need('Customer'),(q,s)=>{const{bid,type,txt}=q.body||{},b=db.bookings.find(x=>x.id==bid&&x.ph==q.ph);if(!b)return E(s,'Booking not found',404);
 db.complaints.unshift({id:db.complaints.length+1,bid,wid:b.wid,type:clean(type,80),txt:clean(txt,500),st:'Submitted'});save();s.json({ok:1})});
A.post('/api/messages',(q,s)=>{const{n,a,m}=q.body||{};if(!n||!m)return E(s,'Enter your name and message');db.msgs.push({n:clean(n,60),a:clean(a,80),m:clean(m,500),d:new Date().toLocaleString()});save();s.json({ok:1})});
A.post('/api/workers/me/online',auth,need('Worker'),(q,s)=>{if(!q.w)return E(s,'No worker profile');q.w.on=q.w.on?0:1;save();s.json({ok:1})});
A.post('/api/complaints/:id/advance',auth,need('Admin'),(q,s)=>{const c=db.complaints.find(x=>x.id==q.params.id),f=['Submitted','Under review','Worker contacted','Resolved'];if(!c)return E(s,'Not found',404);c.st=f[Math.min(f.indexOf(c.st)+1,3)];save();s.json({ok:1})});
A.post('/api/workers/:id/penalize',auth,need('Admin'),(q,s)=>{const w=db.workers.find(x=>x.id==q.params.id);if(!w)return E(s,'Not found',404);w.pen++;if(w.pen>=4)w.st='Banned';else if(w.pen==3)w.st='Suspended';save();s.json({ok:1})});
A.post('/api/workers/:id/toggle',auth,need('Admin'),(q,s)=>{const w=db.workers.find(x=>x.id==q.params.id);if(!w)return E(s,'Not found',404);w.st=w.st=='Active'?'Suspended':'Active';save();s.json({ok:1})});
A.post('/api/prices',auth,need('Admin'),(q,s)=>{const{id,i,v}=q.body||{};if(!CAT[id]||![0,1,2].includes(i)||!(v>=0&&v<=1e5))return E(s,'Invalid price');db.prices[id]=db.prices[id]||[...CAT[id]];db.prices[id][i]=Math.round(v);save();s.json({ok:1})});
A.post('/api/rules',auth,need('Admin'),(q,s)=>{const{k,v}=q.body||{};if(!['free','late','otw'].includes(k)||!(v>=0&&v<=1e4))return E(s,'Invalid rule');db.rules[k]=+v;save();s.json({ok:1})});
A.use((e,q,s,n)=>E(s,'Server error',500));
const PORT = process.env.PORT || 3000;
A.listen(PORT, "0.0.0.0", () => {
  console.log(`QuickFix running on port ${PORT}`);
});
